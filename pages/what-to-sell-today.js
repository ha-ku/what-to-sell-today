import {useState, useEffect, useMemo} from 'react';
import Head from 'next/head';

import {
	Close as CloseIcon,
	AccessTime as AccessTimeIcon,
	ArrowDropUp as ArrowDropUpIcon,
	ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';
import {Button, Link, Tooltip, IconButton, Snackbar, useTheme, Box, useMediaQuery} from '@mui/material';


import hexToRgba from "hex-to-rgba";
import { useHotkeys } from "react-hotkeys-hook";
import useLocalStorageState from "use-local-storage-state";

import HuijiIcon from '../public/img/huijiwiki.svg';
import UniIcon from '../public/img/universalis.svg';

import useSources from "../modules/useSources";
import useMixedRecaptcha from "../modules/useMixedRecaptcha";
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
		</>) : NONE;

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
	HOSTS = ['e6faa6744fbfd5fadfe45dd88b2fc9940be6a585cee47fcb4d0011e1945d6001', 'b65abeda15fa797363ac9525271da0d3a51d8926e57dd030afea8540362f2394'],
	dateFormat = Intl.DateTimeFormat('zh-CN', {month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", hour12: false});

function whatToSellToday({userDarkMode, setUserDarkMode}){

	const [reports, setReports] = useState([]),
		[priceWindow, handlePriceWindow] = useHandler(PRICE_WINDOW, ({target: {value}}) => {
			const window = Number(value)
			return (value.length && (isNaN(window) || window <= 0 || window >= 10)) ? undefined : value;
		}, 'priceWindow'),
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
	const [Recaptcha, executeRecaptcha, setRecaptchaVersion, recaptchaVersion] = useMixedRecaptcha(3);

	const sources = useSources(!!fetchingURL, setError),
		itemList = sources[listSource].withTime ?
			sources[listSource].source.map(item => ({...item, cost: (considerTime ? item.time : 60) / item.amount}))
			: sources[listSource].source,
		fullReports = itemList.length ?
			reports.map(report => Object.assign(report, itemList.find(item => item.name === report.name))) : [];

	const handleWorld = ({target: {value}}) => {
		setWorld(value);
		setServer(SERVER[value]);
	};
	const handleServer = ({target: {value}}) => setServer(value);
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

	const rem = useRem();
	const columns = useMemo(() => ([
		{field: "name", headerName: "物品", width: 230, sortable: false,
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
					<Button variant="text" onClick={() =>
						navigator.clipboard.writeText(params.value).then(() => setClipBarOpen(true))} sx={{minWidth: 0}}>
						{params.value.length > 7 ? `${params.value.slice(0, 7)}...` : params.value}
					</Button>
				</Tooltip>
				{sources[listSource].withTime ? ` (${params.getValue(params.id, "level")}级)` : null}
				<Box sx={{ flexGrow: 1 }} />
				<Tooltip title={<p>
					更新于<br />
					<br />
					本服：{dateFormat.format(params.getValue(params.id, "defaultLastUploadTime"))}<br />
					全服：{dateFormat.format(params.getValue(params.id, "lastUploadTime"))}
				</p>} placement="right">
					<AccessTimeIcon />
				</Tooltip>
			</>)
		},
		{field: "cost", headerName: "成本", width: 34 + 2 * 0.875 * rem, sortable: false,
			valueFormatter: ({value}) => fix(value)},
		{field: "defaultLowest", headerName: "本服最低", width: 160,
			cellClassName: "default-server", headerClassName: "default-server",
			sortComparator: (v1, v2) => lowestComparator(v1?.price, v2?.price), valueFormatter: getDetailPrice},
		{field: "defaultMeanLow", headerName: "平均低价", width: 54 + 4 * 0.875 * rem,
			cellClassName: "default-server", headerClassName: "default-server",
			sortComparator: lowestComparator, valueFormatter: noneOrFix},
		{field: "defaultHistLow", headerName: "成交均价", width: 54 + 4 * 0.875 * rem,
			cellClassName: "default-server", headerClassName: "default-server",
			sortComparator: lowestComparator, valueFormatter: noneOrFix},
		{field: "defaultHistPerCost", headerName: "单位成本价", width: 54 + 5 * 0.875 * rem,
			cellClassName: "default-server", headerClassName: "default-server",
			valueGetter: (params) => {
				let price = params.getValue(params.id, 'defaultHistLow');
				return isNaN(price) ? undefined : (price / params.getValue(params.id, 'cost'));
			}, sortComparator: lowestComparator, valueFormatter: noneOrFix},
		{field: "defaultVolumes", headerName: "1/3/7日成交", width: 150,
			cellClassName: "default-server", headerClassName: "default-server",
			sortable: false, renderCell: ({value}) => renderVolumes(value, {
				height: rowHeight,
				width: 150,
				color: theme.palette.secondary.main,
				darkMode: theme.palette.mode === 'dark'
			})
		},
		{field: "lowest", headerName: "全服最低价", width: 160,
			sortComparator: (v1, v2) => lowestComparator(v1.price, v2.price),  valueFormatter: getDetailPrice},
		{field: "meanLow", headerName: "平均低价", width: 54 + 4 * 0.875 * rem,
			sortComparator: lowestComparator, valueFormatter: noneOrFix},
		{field: "histLow", headerName: "成交均价", width: 54 + 4 * 0.875 * rem,
			sortComparator: lowestComparator, valueFormatter: noneOrFix},
		{field: "histPerCost", headerName: "单位成本价", width: 54 + 5 * 0.875 * rem,
			valueGetter: (params) => {
				let price = params.getValue(params.id, 'histLow');
				return isNaN(price) ? undefined : (price / params.getValue(params.id, 'cost'));
			}, sortComparator: lowestComparator, valueFormatter: noneOrFix},
		{field: "volumes", headerName: "1/3/7日成交", width: 150,
			sortable: false, renderCell: ({value}) => renderVolumes(value, {
				height: rowHeight,
				width: 150,
				color: theme.palette.primary.main,
				darkMode: theme.palette.mode === 'dark'
			})
		}
	]), [sources[listSource].withTime, rem, theme, rowHeight]);

	useEffect(() => {
		const SHA512 = async (message, algorithm = "SHA-512") =>
			Array.prototype.map
				.call(
					new Uint8Array(
						await crypto.subtle.digest(algorithm, new TextEncoder().encode(message))
					),
					(x) => ("0" + x.toString(16)).slice(-2)
				)
				.join("");
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
			const updateHandler = () => {
				if(cache.length) {
					setReports(reports => {
						let newRep = [...reports];
						while(cache.length){
							let rep = cache.pop();
							let i = reports.findIndex(r => r.ID === rep.ID);
							i === -1 ?
								newRep.push(rep)
								: newRep[i] = rep;
						}
						return newRep;
					});
				}
				updateHandlerID = 0;
			}
			const doCache = (message) => {
				console.log(`data: `, message);
				if(message.err) {
					if(message.err.code === 403 && recaptchaVersion === 3)
						setRecaptchaVersion(2);
					else {
						setError(message.err);
						setShouldUpdate(false);
					}
					decoder.destroy();
					return;
				}
				cache.push(message);
				!updateHandlerID ? updateHandlerID = setTimeout(updateHandler, 50) : '';
			}
			decoder.on('data', doCache);
			decoder.on('end', () => {
				setShouldUpdate(false);
				setRetry(0);
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
				let origin = window.location.origin;
				let host = await SHA512(origin.slice(origin.lastIndexOf('.', origin.lastIndexOf('.') - 1) + 1))
				let url = `${HOSTS.some(h => h === host) ? window.location.origin : 'https://aws-cf.ha-ku.cyou' }/marketReport?${
					Object.entries(query).filter(pair => pair[1] !== null && typeof pair[1] !== 'undefined')
						.map(pair =>  pair.join('=')).join('&')
				}`
				setURL(url);
				console.log('controller aborted', controller.signal.aborted);
				try {
					let response = await window.fetch(url, {signal: controller.signal})
					console.log('controller aborted', controller.signal.aborted);
					let reader = response.body.getReader();
					reader.read().then(function onData({done, value}) {
						if(decoder.destroyed) {
							return;
						}
						if (done) {
							decoder.end();
							return;
						}
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
						setTimeout(() => {
							executeRecaptcha('marketReport').then(res).catch(rej)
						}, 200)
					})
				})
				.then(doMarketReport)

			return () => {
				console.log('effect callback');
				controller.abort();
				if(updateHandlerID) {
					clearTimeout(updateHandlerID);
					updateHandler();
				}
				decoder.destroy();
			}
		}
	}, [isLoading, listSource, executeRecaptcha, recaptchaVersion]);

	const rows = useMemo(() => fullReports.map((rep) => ({
		id: rep.ID,
		name: rep.name,
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
		return (<ErrorCover {...{retry: retry < RETRY, error}}/>);
	}

	return (
		<>
			<Head>
				<title>今天{`${sources[listSource].target}${sources[listSource].action}`}什么划算？</title>
			</Head>
			<NavBar
				listSource={listSource}
				handleSource={handleSource}
				onMenu={() => setDrawer(d => !d)}
				sources={sources}
				isLoading={isLoading}
			/>
			<SettingDrawer
				open={{value: drawer, handler: () => setDrawer(false)}}
				userDarkMode={{value: userDarkMode, handler: ({target: {value}}) => setUserDarkMode(value)}}
				quality={{value: quality, handler: handleQuality}}
				considerTime={{value: considerTime, handler: handleConsiderTime}}
				world={{value: world, handler: handleWorld}}
				server={{value: server, handler: handleServer}}
				priceWindow={{value: priceWindow, handler: handlePriceWindow}}
				isLoading={{value: isLoading, handler: handleUpdate}}
				sources={sources} listSource={listSource}
			/>
			<StyledGridContainer defaultColor={hexToRgba(theme.palette.secondary.main, 0.2)}>
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
			<Recaptcha
				sitekey="6LdImA0eAAAAAKhZ7-36jnBNBu34ytwAN5CfNwq8"
				badge="bottomright"
				hl="zh-CN"
				size="invisible"
				theme={theme.palette.mode}
			/>
			<Snackbar open={clipBarOpen} autoHideDuration={1000} onClose={() => setClipBarOpen(false)} message="已拷贝至剪贴板" action={
				<IconButton size="small" onClick={() => setClipBarOpen(false)} >
					<CloseIcon fontSize="small"/>
				</IconButton>
			} />
		</>
	);
}


export default whatToSellToday