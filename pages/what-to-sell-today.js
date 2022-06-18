import {useState, useEffect, useMemo} from 'react';
import {unstable_batchedUpdates} from 'react-dom';
import Head from 'next/head';

import {
	Close as CloseIcon,
	AccessTime as AccessTimeIcon,
	ArrowDropUp as ArrowDropUpIcon,
	ArrowDropDown as ArrowDropDownIcon,
	ArrowDownward as ArrowDownwardIcon,
	ArrowUpward as ArrowUpwardIcon
} from '@mui/icons-material';
import {Button, Link, Tooltip, IconButton, Snackbar, Box, useMediaQuery} from '@mui/material';
import {useTheme} from '@mui/material/styles';


import { useHotkeys } from "react-hotkeys-hook";
import useLocalStorageState from "use-local-storage-state";

import HuijiIcon from '../public/img/huijiwiki.svg';
import UniIcon from '../public/img/universalis.svg';

import useSources from "../modules/useSources";
import MixedRecaptcha from "../modules/MixedRecaptcha";
import useHandler from "../modules/useHandler";
import useWindowSize from '../modules/useWindowSize';
import { reportDecoder } from "../avro/marketReportTypes.mjs";


import {worlds, servers, worldsName, serversName} from '../modules/worldsAndServers';
import {StyledCellSub, StyledIcon, StyledIconButton, StyledCellContainer, StyledGridContainer, StyledCircularProgress } from '../modules/styledComponents'
import ErrorCover from "../modules/ErrorCover";
import NavBar from "../modules/NavBar";
import SettingDrawer from "../modules/SettingDrawer";
import PinnableDataGrid from "../modules/PinnableDataGrid";
import useRem from "../modules/useRem";
import LineChart from "../modules/LineChart";
import useTranslate from "../modules/useTranslate";
import {v2, v3} from "../modules/recaptchaPublicKey";

import {colord, extend} from "colord";
import mixPlugin from "colord/plugins/mix";
extend([mixPlugin]);


const fix = (num) => Number(num.toFixed(1)),
	lowestComparator = (v1, v2) =>
		isNaN(v1) ? -1 :
			isNaN(v2) ? 1 :
				v1 - v2,
	noneOrFix = ({value}) => (isNaN(value) || value === null) ? NONE : fix(value),
	getDetailPrice = ({value}) => value ? `${value.price} ( x${value.quantity} ${value.seller})` : NONE,
	renderVolumes = (value, lineProps) =>
		value?.length ? (<>
			<Box sx={{
				position: 'relative',
				alignSelf: 'flex-start'
			}}>
				<Box sx={{
					position: 'absolute',
					left: -10,
					top: 0
				}}>
					<LineChart {...lineProps} data={value.map((v, i) => [i, v])} />
				</Box>
			</Box>
			<StyledCellContainer>
				{[1,3,7].map(i => value[i-1]).map((v, i) => (
					<StyledCellSub key={i}>
						{v}
					</StyledCellSub>
				))}
			</StyledCellContainer>
		</>) : NONE,
	renderHistPerCost = (value, upperBound, lowerBound) => (<>
		{noneOrFix({value})}
		<Box sx={{ flexGrow: 1 }} />
		{!value || (value > (upperBound ? upperBound : Number.MAX_SAFE_INTEGER)) ?
			(<ArrowDownwardIcon color="warning" fontSize="small" />) :
			((value < (lowerBound ? lowerBound : Number.MAX_SAFE_INTEGER)) ? (<ArrowUpwardIcon color="success" fontSize="small" />) : null)
		}
	</>);
const getActualTime = (job, item) => (60 - Math.min(Math.floor(Math.max(job.level-item.level, 0) / 10), 2) * 10)
const getactualAmount = ({perception, averageItemLevel}, item) => {
	const levels = Object.keys(item.amount).map(n => Number(n))
	return item.amount[Math.max( ...(levels.filter(n => n <= (perception ?? averageItemLevel))) )]
}

const NONE = '无',
	RETRY = 3,
	PRICE_WINDOW = 5,
	QUALITY = 'nq',
	WORLD = worlds[0],
	SERVER = worlds.reduce((a, w, i) => {
		a[w] = servers[i][0];
		return a;
	}, {}),
	SOURCE = 'companySeal',
	CONSIDER_TIME = true,
	SORTING_ORDER = ['desc', 'asc', null],
	dateFormat = new Intl.DateTimeFormat('zh-CN', {month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", hour12: false});


function whatToSellToday({userDarkMode, setUserDarkMode, setLocale}){

	const [reports, setReports] = useState([]),
		[priceWindow, setPriceWindow] = useLocalStorageState('priceWindow', {ssr: true, defaultValue: PRICE_WINDOW}),
		[world, setWorld] = useLocalStorageState('world', {ssr: true, defaultValue: WORLD}),
		[server, setServer] = useLocalStorageState('server', {ssr: true, defaultValue: SERVER[WORLD]}),
		[quality, handleQuality] = useHandler(QUALITY, ({target: {value}}) => value, 'quality'),
		[considerTime, handleConsiderTime] = useHandler(CONSIDER_TIME, ({target: {checked}}) => checked, 'considerTime'),
		[listSource, handleSource] = useHandler(SOURCE, ({target: {value}}) => {
			setPage(0);
			setReports([]);
			if(!isLoading) {
				setTimeout(handleUpdate, 0)
			}
			return value;
		}, 'source'),
		[sortModel, handleSort] = useHandler(undefined, gridSort =>
				sortModel => JSON.stringify(gridSort) === JSON.stringify(sortModel) ?
					sortModel
					: gridSort
			, 'sortModel');

	const [isLoading, setShouldUpdate] = useState(true),
		[error, setError] = useState(null),
		[retry, setRetry] = useState(0),
		[fetchingURL, setURL] = useState(null),
		[queryInfo, setQueryInfo] = useState({
			worldName: worldsName[worlds.indexOf(world)],
			serverName: serversName[worlds.indexOf(world)][servers[worlds.indexOf(world)].indexOf(server)]
		});

	const [drawer, setDrawer] = useState(false),
		[clipBarOpen, setClipBarOpen] = useState(false),
		[page, setPage] = useState(0);

	const theme = useTheme();

	const [jobInfo, setJobInfo] = useLocalStorageState("jobInfo", {
		ssr: true,
		defaultValue: {
			botany: {level: '', gathering: '', perception: '', },
			mining: {level: '', gathering: '', perception: '', },
			fish: {level: '', gathering: '', perception: '', },
			hunting: {level: '', averageItemLevel: '', },
		}
	});
	const sources = useSources(!!fetchingURL, setError);
	let fullReports = useMemo(() => {
		console.log('pair ID');
		const itemList = sources[listSource].source;
		return itemList.length ?
			reports.map(report => Object.assign(report, itemList.find(item => item.ID === report.ID))) : [];
	}, [sources[listSource], reports]);
	fullReports = useMemo(() => {
		console.log('recalculate cost')
		let newFullReports = fullReports;
		if(sources[listSource].withTime) {
			const job = Object.assign(...Object.keys(jobInfo[listSource]).map(key =>({
				[key]: jobInfo[listSource][key].length ?
					Number(jobInfo[listSource][key])
					: Number.MAX_SAFE_INTEGER
			})));
			newFullReports = newFullReports.filter(item =>
				(item.level <= job.level) && !(item.threshold > (job.gathering ?? job.averageItemLevel))
			)
			newFullReports.forEach(item => {
				item.cost = (considerTime ? getActualTime(job, item) : 60) / getactualAmount(job, item)
			})
		}
		return newFullReports;
	}, [fullReports, sources[listSource].withTime, jobInfo, considerTime]);
	const handleUpdate = () => {
		console.log('handleUpdate');
		setShouldUpdate(true);
	}
	useHotkeys('f5,alt+r', (event) => {
		if(!error) {
			event.preventDefault();
			handleUpdate();
		}
	}, [error]);
	const { height } = useWindowSize();
	const isSmallDevice = useMediaQuery(theme.breakpoints.down('md'));

	const rowHeight = isSmallDevice ? 36 : 52;
	const [pageSize, setPageSize] = useState(height ? Math.max(Math.floor((height - 226) / rowHeight ), 5) : 5);
	useHotkeys('left,alt+a', () => setPage(page => Math.max(page-1, 0)));
	useHotkeys('right,alt+d', () => setPage(page => Math.min(page+1, Math.ceil(reports.length / pageSize) - 1)), [reports, pageSize]);

	const { t ,locale } = useTranslate('grid')
	const {t: navT} = useTranslate('navbar');
	const [recaptchaVersion, setRecaptchaVersion] = useState(3);
	const [{execute: executeRecaptcha}, setExecuteRecaptcha] = useState({execute: null});
	const [v2Props, v3Props] = useMemo(() => ([
		{
			sitekey: v2,
			badge: "bottomright",
			hl: locale === 'zh' ? "zh-CN" : 'en',
			size: "invisible"
		},{
			reCaptchaKey: v3,
			language: locale,
			useRecaptchaNet: true,
			scriptProps: {async: true, defer: true},
		}
	]), [locale])

	const rem = useRem();
	const columns = useMemo(() => ([
		{field: "name", headerName: t('item'), width: 230, sortable: false,
			renderCell: (params) => (<>
				<Tooltip placement="bottom-start" sx={{padding: 0}} title={<span>
					<StyledIconButton size="small">
						<Link target="_blank" href={`https://universalis.app/market/${params.id}`} rel="noopener noreferrer">
							<StyledIcon render={UniIcon} fill='#c2d0ff' viewBox="0 0 145.9 68.5"/>
						</Link>
					</StyledIconButton>
					<StyledIconButton size="small">
						<Link target="_blank" href={`https://ff14.huijiwiki.com/wiki/物品:${params.value}`} rel="noopener noreferrer">
							<StyledIcon render={HuijiIcon} fill='#ffffff' viewBox="0 0 135.55 61.26"/>
						</Link>
					</StyledIconButton>
				</span>}>
					<Button variant="text" sx={{textTransform: 'initial', minWidth: 0}} onClick={() =>
						navigator.clipboard.writeText(params.value).then(() => setClipBarOpen(true))}
					>
						<Box component="span" sx={{maxWidth: sources[listSource].withTime ? '109px' : '169px', overflow: "hidden", textOverflow: "ellipsis"}}>
							{t("itemName", {
								name: params.value,
								enName: params.getValue(params.id, "enName")
							})}
						</Box>
					</Button>
				</Tooltip>
				{sources[listSource].withTime ?
					t("level", {level: params.getValue(params.id, "level")})
					: null
				}
				<Box sx={{ flexGrow: 1 }} />
				<Tooltip title={<p>
					{t("updateAt")}<br />
					<br />
					{t("updateLocalAt")}: {dateFormat.format(params.getValue(params.id, "defaultLastUploadTime"))}<br />
					{t("updateGlobalAt")}: {dateFormat.format(params.getValue(params.id, "lastUploadTime"))}
				</p>} placement="right">
					<AccessTimeIcon sx={{
						color: colord(theme.palette.text.primary).mix(theme.palette.warning.main,
								Math.min((new Date().getTime() - params.getValue(params.id, "defaultLastUploadTime")) / 43200000, 1)
						).toHex()
					}}/>
				</Tooltip>
			</>)
		},
		{field: "cost", headerName: t('cost'), width: 34 + 2 * 0.875 * rem, sortable: false,
			valueFormatter: ({value}) => fix(value)},
		{field: "defaultLowest", headerName: t('defaultLowest'), width: 160,
			cellClassName: "default-server", headerClassName: "default-server",
			sortComparator: (v1, v2) => lowestComparator(v1?.price, v2?.price), valueFormatter: getDetailPrice},
		{field: "defaultMeanLow", headerName: t('defaultMeanLow'), width: 54 + 4 * 0.875 * rem,
			cellClassName: "default-server", headerClassName: "default-server",
			sortComparator: lowestComparator, valueFormatter: noneOrFix},
		{field: "defaultHistLow", headerName: t('defaultHistLow'), width: 54 + 4 * 0.875 * rem,
			cellClassName: "default-server", headerClassName: "default-server",
			renderCell: (params) => renderHistPerCost(params.value, params.getValue(params.id, "defaultMeanLow"), params.getValue(params.id, "defaultLowest")?.price),
			sortComparator: lowestComparator, valueFormatter: noneOrFix},
		{field: "defaultHistPerCost", headerName: t('defaultHistPerCost'), width: 54 + 5 * 0.875 * rem,
			cellClassName: "default-server", headerClassName: "default-server",
			valueGetter: (params) => {
				let price = params.getValue(params.id, 'defaultHistLow');
				return isNaN(price) ? undefined : (price / params.getValue(params.id, 'cost'));
			}, sortComparator: lowestComparator, valueFormatter: noneOrFix},
		{field: "defaultVolumes", headerName: t('volumes'), width: 150,
			cellClassName: "default-server", headerClassName: "default-server",
			sortable: false, renderCell: ({value}) => renderVolumes(value, {
				height: rowHeight,
				width: 150,
				color: theme.palette.secondary.main,
				darkMode: theme.palette.mode === 'dark'
			})
		},
		{field: "lowest", headerName: t('lowest'), width: 160,
			sortComparator: (v1, v2) => lowestComparator(v1.price, v2.price),  valueFormatter: getDetailPrice},
		{field: "meanLow", headerName: t('meanLow'), width: 54 + 4 * 0.875 * rem,
			sortComparator: lowestComparator, valueFormatter: noneOrFix},
		{field: "histLow", headerName: t('histLow'), width: 54 + 4 * 0.875 * rem,
			renderCell: (params) => renderHistPerCost(params.value, params.getValue(params.id, "meanLow"), params.getValue(params.id, "lowest")?.price),
			sortComparator: lowestComparator, valueFormatter: noneOrFix},
		{field: "histPerCost", headerName: t('histPerCost'), width: 54 + 5 * 0.875 * rem,
			valueGetter: (params) => {
				let price = params.getValue(params.id, 'histLow');
				return isNaN(price) ? undefined : (price / params.getValue(params.id, 'cost'));
			}, sortComparator: lowestComparator, valueFormatter: noneOrFix},
		{field: "volumes", headerName: t('volumes'), width: 150,
			sortable: false, renderCell: ({value}) => renderVolumes(value, {
				height: rowHeight,
				width: 150,
				color: theme.palette.primary.main,
				darkMode: theme.palette.mode === 'dark'
			})
		}
	]), [sources[listSource].withTime, rem, theme, rowHeight]);

	useEffect(() => {
		if(isLoading && executeRecaptcha) {
			console.log('new controller')
			setQueryInfo({
				worldName: worldsName[worlds.indexOf(world)],
				serverName: serversName[worlds.indexOf(world)][servers[worlds.indexOf(world)].indexOf(server)]
			})
			let decoder = reportDecoder(),
				controller = new AbortController(),
				cache = [],
				updateHandlerID = 0;
			controller.ts = new Date().getTime();
			const updateHandler = () => {
				if(cache.length) {
					setReports(reports => {
						let newRep = [...reports];
						cache.forEach((rep) => {
							let i = reports.findIndex(r => r.ID === rep.ID);
							i === -1 ? newRep.push(rep) : newRep[i] = rep;
						})
						cache = []
						return newRep;
					});
				}
				updateHandlerID = 0;
			}
			const doCache = (message) => {
				console.log(`data: `, message);
				if(message.err) {
					unstable_batchedUpdates(() => {
						if (message.err.code === 403 && recaptchaVersion === 3) {
							setExecuteRecaptcha({execute: null});
							setRecaptchaVersion(2);
						} else {
							setError(message.err);
							setShouldUpdate(false);
						}
					})
					decoder.destroy();
					return;
				}
				cache.push(message);
				!updateHandlerID ? updateHandlerID = setTimeout(updateHandler, 200) : '';
			}
			decoder.on('data', doCache);
			decoder.on('end', () => {
				setTimeout(() => {
					unstable_batchedUpdates(() => {
						setShouldUpdate(false);
						setRetry(0);
					})
				}, 200)
			})

			const doMarketReport = async (token) => {
				let query = {
					qual: quality,
					world,
					server,
					priceWindow,
					itemListName: listSource + 'List',
					token,
					recaptchaVersion: 'v' + recaptchaVersion
				}
				let url = `${window.location.origin}/marketReport?${
					Object.entries(query).filter(pair => pair[1] !== null && typeof pair[1] !== 'undefined')
						.map(pair =>  pair.join('=')).join('&')
				}`
				setURL(url);
				try {
					let response = await window.fetch(url, {signal: controller.signal})
					let reader = response.body.getReader();
					reader.read().then(function onData({done, value}) {
						if(decoder.destroyed)
							return;
						if (done)
							return decoder.end();
						decoder.write(value);
						reader.read().then(onData)
					})
				} catch(err) {
					if(err.code !== 20)
						setError(err);
				}
			}

			executeRecaptcha('marketReport')
				.catch(err => {
					console.log('recaptcha error:', err);
					return new Promise((res, rej) => {
						setTimeout(() => executeRecaptcha('marketReport').then(res).catch(rej), 200)
					})
				})
				.then(doMarketReport)

			return () => {
				console.log('effect callback');
				controller.abort();
				if(updateHandlerID) {
					clearTimeout(updateHandlerID);
					//updateHandler();
				}
				decoder.destroy();
			}
		}
	}, [isLoading, listSource, executeRecaptcha, recaptchaVersion, world, server, priceWindow]);

	const rows = useMemo(() => fullReports.map((rep) => ({
		id: rep.ID,
		name: rep.name,
		enName: rep.enName,
		cost: rep.cost,
		defaultLowest: rep.defaultServer[quality]?.lowestPrice,
		defaultMeanLow: rep.defaultServer[quality]?.meanLowPrice,
		defaultHistLow: rep.defaultServer[quality]?.meanLowHistoryPrice,
		defaultVolumes: rep.defaultServer[quality]?.volumns,
		lowest: rep[quality]?.lowestPrice,
		meanLow: rep[quality]?.meanLowPrice,
		histLow: rep[quality]?.meanLowHistoryPrice,
		volumes: rep[quality]?.volumns,
		lastUploadTime: rep.lastUploadTime,
		defaultLastUploadTime: rep.defaultServer.lastUploadTime,
		...(rep.level !== undefined ? {level : rep.level} : {} )
	})), [fullReports]);

	if(error) {
		if(retry < RETRY) {
			setRetry(retry => retry + 1);
			setTimeout(() => {
				setError(null);
				setShouldUpdate(true);
			}, 2500);
		}
	}

	return (
		<>
			<Head>
				<title>
					{t("title", {action: navT(sources[listSource].action), target: navT(sources[listSource].target)})}
				</title>
			</Head>
			<NavBar
				listSource={listSource}
				handleSource={handleSource}
				onMenu={() => setDrawer(d => !d)}
				sources={sources}
				isLoading={isLoading}
				setLocale={setLocale}
			/>
			<SettingDrawer
				open={{value: drawer, handler: () => setDrawer(false)}}
				userDarkMode={{value: userDarkMode, handler: ({target: {value}}) => setUserDarkMode(value)}}
				quality={{value: quality, handler: handleQuality}}
				considerTime={{value: considerTime, handler: handleConsiderTime}}
				world={{value: world, handler: setWorld}}
				server={{value: server, handler: setServer}}
				priceWindow={{value: priceWindow, handler: setPriceWindow}}
				isLoading={{value: isLoading, handler: handleUpdate}}
				jobInfo={{value: jobInfo, handler: setJobInfo}}
			/>
			<StyledGridContainer defaultColor={colord(theme.palette.secondary.main).alpha(0.2).toHex()}>
				{ !!fetchingURL ?
					(<PinnableDataGrid hideFooterSelectedRowCount sx={{
						'& .MuiDataGrid-footerContainer': {
							justifyContent: 'flex-end !important',
							flexDirection: 'row-reverse'
						},
						'& .MuiDataGrid-columnHeaderTitleContainer .MuiIconButton-root': {
							padding: '1px'
						},
						'& .MuiDataGrid-footerContainer::before': {
						content: `"${queryInfo.worldName} ${queryInfo.serverName}"`
						}
					}} {...{
						rows, columns, pageSize, page,
						disableColumnMenu: true,
						sortingOrder: SORTING_ORDER,
						onSortModelChange: handleSort,
						onPageChange: setPage,
						onPageSizeChange: setPageSize,
						components: {
							ColumnSortedAscendingIcon: ArrowDropUpIcon,
							ColumnSortedDescendingIcon: ArrowDropDownIcon
						},
						pinnedColumns: {left: ['name']},
						...(isSmallDevice ? { density: "compact" } : {}),
						...(sortModel ? { sortModel } : {})
					}}/>) : <StyledCircularProgress />}
			</StyledGridContainer>
			<MixedRecaptcha
				version={recaptchaVersion}
				onLoad={setExecuteRecaptcha}
				v2Props={v2Props}
				v3Props={v3Props}
			/>
			<Snackbar open={clipBarOpen} autoHideDuration={1000} onClose={() => setClipBarOpen(false)} message={t('copyHint')} action={
				<IconButton size="small" onClick={() => setClipBarOpen(false)} >
					<CloseIcon fontSize="small"/>
				</IconButton>
			} />
			{
				error ? <ErrorCover {...{retry: retry < RETRY, error}}/> : null
			}
		</>
	);
}



export default whatToSellToday