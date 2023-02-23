import {useState, useEffect, useMemo, startTransition, useCallback, Suspense, lazy} from 'react';

import {useMediaQuery, Skeleton, Backdrop} from '@mui/material';
import {useTheme} from '@mui/material/styles';


import { useHotkeys } from "react-hotkeys-hook";
import useLocalStorageState from "use-local-storage-state";

import useSources from "./useSources";
import MixedRecaptcha from "./MixedRecaptcha";
import useHandler from "./useHandler";
import useWindowSize from './useWindowSize';
import Pbf from 'pbf';
import {Report} from '../backend/protobuf/MarketReport';
import lpstream from "../backend/modules/lengthPrefixedWebstream.mjs";


import {worlds, servers, worldsName, serversName} from './worldsAndServers';
import useRem from "./useRem";
import useTranslate from "./useTranslate";
import {v2, v3} from "./recaptchaPublicKey";
import {StyledMainContainer} from "./styledComponents";

const ErrorCover = lazy(() => import('./ErrorCover'));
const NavBar = lazy(() => import('./NavBar'));
const SettingDrawer = lazy(() => import('./SettingDrawer'));
const ItemName = lazy(() => import('./ItemName'));
const ItemHistPerCost = lazy(() => import('./ItemHistPerCost'));
const ItemVolumns = lazy(() => import('./ItemVolumns'));
const LinearProgress = lazy(() => import('./LinearProgress'));
const CopyHint = lazy(() => import('./CopyHint'));
const PinnableDataGrid = lazy(() => import('./PinnableDataGrid'));


const NONE = '无',
	RETRY = 1,
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
	JOB_INFO = {
		botany: {level: '', gathering: '', perception: '', },
		mining: {level: '', gathering: '', perception: '', },
		fish: {level: '', gathering: '', perception: '', },
		hunting: {level: '', averageItemLevel: '', },
	},
	ENDPOINTS = process.env.NEXT_PUBLIC_WTST_ENDPOINTS.split(' ');

const lowestComparator = (v1, v2) =>
		isNaN(v1) ? -1 :
			isNaN(v2) ? 1 :
				v1 - v2,
	noneOrFix = ({value}) => (isNaN(value) || value === null) ? NONE : Number(value.toFixed(1)),
	getDetailPrice = ({value}) => value ? `${value.price} ( x${value.quantity} ${value.seller})` : NONE;
const getActualTime = (job, item) => (60 - Math.min(Math.floor(Math.max(job.level-item.level, 0) / 10), 2) * 10)
const getactualAmount = ({perception, averageItemLevel}, item) => {
	const levels = Object.keys(item.amount).map(n => Number(n))
	return item.amount[Math.max( ...(levels.filter(n => n <= (perception ?? averageItemLevel))) )]
}

function whatToSellToday({userDarkMode, handleUserDarkMode, setLocale}){

	const [reports, setReports] = useState([]),
		[priceWindow, setPriceWindow] = useLocalStorageState('priceWindow', {ssr: true, defaultValue: PRICE_WINDOW}),
		[world, setWorld] = useLocalStorageState('world', {ssr: true, defaultValue: WORLD}),
		[server, setServer] = useLocalStorageState('server', {ssr: true, defaultValue: SERVER[WORLD]}),
		[quality, handleQuality] = useHandler(QUALITY, ({target: {value}}) => value, 'quality'),
		[considerTime, handleConsiderTime] = useHandler(CONSIDER_TIME, ({target: {checked}}) => checked, 'considerTime'),
		[listSource, handleSource] = useHandler(SOURCE, ({target: {value}}) => {
			setPage(0);
			setReports([]);
			setProgress(0);
			setBuffer(0);
			setTimeout(() => setShouldUpdate(true), 0)
			return value;
		}, 'source');

	const [isLoading, setShouldUpdate] = useState(true),
		[error, setError] = useState(null),
		[retry, setRetry] = useState(0),
		[queryInfo, setQueryInfo] = useState({
			worldName: worldsName[worlds.indexOf(world)],
			serverName: serversName[worlds.indexOf(world)][servers[worlds.indexOf(world)].indexOf(server)]
		});

	const [progress, setProgress] = useState(0),
		[buffer, setBuffer] = useState(0);

	const [drawer, handleDrawer] = useHandler(false, () => (d => !d)),
		[clipBarOpen, setClipBarOpen] = useState(false),
		doCopy = useCallback(({target: {innerText}}) =>
			navigator.clipboard.writeText(innerText).then(() => setClipBarOpen(true))
		, []),
		[page, setPage] = useState(0);

	const theme = useTheme();

	const [jobInfo, setJobInfo] = useLocalStorageState("jobInfo", {
		ssr: true,
		defaultValue: JOB_INFO
	});
	const sources = useSources(listSource, setError);
	let fullReports = useMemo(() => {
		//.log('pair ID');
		const itemList = sources[listSource].source;
		return itemList.length ?
			reports.map(report => Object.assign(report, itemList.find(item => item.ID === report.ID))) : [];
	}, [sources[listSource], reports]);
	fullReports = useMemo(() => {
		//console.log('recalculate cost')
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
	useHotkeys('f5', (event) => {
		if(!error && !isLoading) {
			event.preventDefault();
			setShouldUpdate(true);
		}
	}, [error, isLoading]);
	const { height } = useWindowSize();
	const isSmallDevice = useMediaQuery(theme.breakpoints.down('md'));

	const rowHeight = isSmallDevice ? 36 : 52;
	const [pageSize, setPageSize] = useState(height ? Math.max(Math.floor((height - 226) / rowHeight ), 5) : 5);
	useHotkeys('left', () => setPage(page => Math.max(page-1, 0)));
	useHotkeys('right', () => setPage(page => Math.min(page+1, Math.ceil(reports.length / pageSize) - 1)), [reports, pageSize]);

	const { t ,locale } = useTranslate('grid')
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
			container: {
				element: 'MixedRecaptcha-badge-container',
				parameters: {
					badge: "bottomright",
					theme: theme.palette.mode
				}
			}
		}
	]), [locale, theme.palette.mode])

	const rem = useRem();
	const columns = useMemo(() => ([
		{field: "name", headerName: t('item'), width: 230, sortable: false,
			renderCell: (params) =>
				(<Suspense fallback={<Skeleton variant="text" />}>
					<ItemName
						withTime={sources[listSource].withTime}
						id={params.id}
						value={params.value}
						enName={params.getValue(params.id, "enName")}
						level={params.getValue(params.id, "level")}
						defaultLastUploadTime={params.getValue(params.id, "defaultLastUploadTime")}
						lastUploadTime={params.getValue(params.id, "lastUploadTime")}
						onClick={doCopy}
						primary={theme.palette.text.primary}
						warning={theme.palette.warning.main}
					/>
				</Suspense>)
		},
		{field: "cost", headerName: t('cost'), width: 34 + 2 * 0.875 * rem, sortable: false,
			valueFormatter: ({value}) => Number(value.toFixed(3))},
		{field: "defaultLowest", headerName: t('defaultLowest'), width: 160,
			cellClassName: "default-server", headerClassName: "default-server",
			sortComparator: (v1, v2) => lowestComparator(v1?.price, v2?.price), valueFormatter: getDetailPrice},
		{field: "defaultMeanLow", headerName: t('defaultMeanLow'), width: 54 + 4 * 0.875 * rem,
			cellClassName: "default-server", headerClassName: "default-server",
			sortComparator: lowestComparator, valueFormatter: noneOrFix},
		{field: "defaultHistLow", headerName: t('defaultHistLow'), width: 54 + 4 * 0.875 * rem,
			cellClassName: "default-server", headerClassName: "default-server",
			renderCell: (params) =>
				(<Suspense fallback={<Skeleton variant="text" />}>
					<ItemHistPerCost
						value={params.value}
						upperBound={params.getValue(params.id, "defaultMeanLow")}
						lowerBound={params.getValue(params.id, "defaultLowest")?.price}
						valueFormatter={noneOrFix}
					/>
				</Suspense>),
			sortComparator: lowestComparator},
		{field: "defaultHistPerCost", headerName: t('defaultHistPerCost'), width: 54 + 5 * 0.875 * rem,
			cellClassName: "default-server", headerClassName: "default-server",
			valueGetter: (params) => {
				let price = params.getValue(params.id, 'defaultHistLow');
				return isNaN(price) ? undefined : (price / params.getValue(params.id, 'cost'));
			}, sortComparator: lowestComparator, valueFormatter: noneOrFix},
		{field: "defaultVolumes", headerName: t('volumes'), width: 150,
			cellClassName: "default-server", headerClassName: "default-server",
			sortable: false, renderCell: ({value}) => value?.length ?
				(<Suspense fallback={<Skeleton variant="text" />}>
					<ItemVolumns
						value={value}
						height={rowHeight}
						color={theme.palette.secondary.main}
						darkMode={theme.palette.mode === 'dark'}
					/>
				</Suspense>) : NONE
		},
		{field: "lowest", headerName: t('lowest'), width: 160,
			sortComparator: (v1, v2) => lowestComparator(v1.price, v2.price),  valueFormatter: getDetailPrice},
		{field: "meanLow", headerName: t('meanLow'), width: 54 + 4 * 0.875 * rem,
			sortComparator: lowestComparator, valueFormatter: noneOrFix},
		{field: "histLow", headerName: t('histLow'), width: 54 + 4 * 0.875 * rem,
			renderCell: (params) =>
				(<Suspense fallback={<Skeleton variant="text" />}>
					<ItemHistPerCost
						value={params.value}
						upperBound={params.getValue(params.id, "meanLow")}
						lowerBound={params.getValue(params.id, "lowest")?.price}
						valueFormatter={noneOrFix}
					/>
				</Suspense>),
			sortComparator: lowestComparator, valueFormatter: noneOrFix},
		{field: "histPerCost", headerName: t('histPerCost'), width: 54 + 5 * 0.875 * rem,
			valueGetter: (params) => {
				let price = params.getValue(params.id, 'histLow');
				return isNaN(price) ? undefined : (price / params.getValue(params.id, 'cost'));
			}, sortComparator: lowestComparator, valueFormatter: noneOrFix},
		{field: "volumes", headerName: t('volumes'), width: 150,
			sortable: false, renderCell: ({value}) => value?.length ?
				(<Suspense fallback={<Skeleton variant="text" />}>
					<ItemVolumns
						value={value}
						height={rowHeight}
						color={theme.palette.primary.main}
						darkMode={theme.palette.mode === 'dark'}
					/>
				</Suspense>) : NONE
		}
	]), [sources[listSource].withTime, rem, theme, rowHeight]);
	const [sortModel, handleSort] = useHandler(undefined, gridSort =>
			sortModel => JSON.stringify(gridSort) === JSON.stringify(sortModel) ?
				sortModel
				: gridSort
		, 'sortModel')

	useEffect(() => {
		if(isLoading && executeRecaptcha) {
			setQueryInfo({
				worldName: worldsName[worlds.indexOf(world)],
				serverName: serversName[worlds.indexOf(world)][servers[worlds.indexOf(world)].indexOf(server)]
			})

			const handleDecoderEnd = () => {
				setShouldUpdate(false);
				setRetry(0);
				setProgress(0);
				setBuffer(0);
			}
			let controller = new AbortController(),
				decoder = lpstream.decode(),
				reader = decoder.readable.getReader();
			reader.read().then(function onData({done, value: _message}) {
				if(done) {
					handleDecoderEnd();
					return;
				}
				const message = Report.read(new Pbf(_message))
				console.log(message);
				if(message.err) {
					if (message.err.code === 403 && recaptchaVersion === 3) {
						setExecuteRecaptcha({execute: null});
						setRecaptchaVersion(2);
					} else {
						setError(message.err);
						setShouldUpdate(false);
						setProgress(0);
						setBuffer(0);
					}
					return;
				}
				setBuffer(b => b+1);
				startTransition(() => {
					setReports(reports => {
						let newRep = [...reports];
						let i = reports.findIndex(r => r.ID === message.ID);
						i === -1 ? newRep.push(message) : newRep[i] = message;
						return newRep;
					});
					setProgress(p => p+1);
				});
				return reader.read().then(onData);
			})

			async function doMarketReport() {
				let token = await executeRecaptcha('marketReport')
					.catch(err => {
						console.log('recaptcha error:', err);
						return new Promise((res, rej) => {
							setTimeout(() => executeRecaptcha('marketReport').then(res).catch(rej), 200)
						})
					})
				let query = {
					world, server, priceWindow, token,
					qual: quality,
					itemListName: listSource + 'List',
					recaptchaVersion: 'v' + recaptchaVersion,
				}
				let url = `https://${ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)]}-cf.ha-ku.cyou/marketReportPbfCfProxy?${
					Object.entries(query).filter(pair => pair[1] !== null && typeof pair[1] !== 'undefined')
						.map(pair =>  pair.join('=')).join('&')
				}`
				let response = await window.fetch(url, {signal: controller.signal})
				await response.body.pipeTo(decoder.writable);
			}
			doMarketReport().catch((err) => {
				if(err.code !== 20)
					setError(err);
			})

			return () => {
				//console.log('effect callback');
				controller.abort();
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

	useEffect(() => {
		if(error) {
			if(retry < RETRY) {
				let ID = setTimeout(() => {
					setError(null);
					setRetry(retry => retry + 1);
					setShouldUpdate(true);
				}, 2500);
				return () => clearTimeout(ID);
			}
		}
	}, [error, retry]);
	const gridFooterContent = `"${queryInfo.worldName} ${queryInfo.serverName}"`
	const gridMemorizeProps = useMemo(() => ({
		pinnedColumns: {left: ['name']},
		...(isSmallDevice ? { density: "compact" } : {}),
	}), [isSmallDevice]);

	return (
		<>
			<Suspense fallback={<Skeleton variant="rectangular" width="100%" height={4} sx={{position: "fixed", top: 0, left: 0, width: '100%', zIndex: 2000}} />}>
				{isLoading ?
					<LinearProgress
						variant="buffer"
						value={progress / sources[listSource].source.length * 100}
						valueBuffer={buffer / sources[listSource].source.length * 100}
						color="secondary"
						sx={{position: "fixed", top: 0, left: 0, width: '100%', zIndex: 2000}}
					/>
					: null
				}
			</Suspense>
			<Suspense fallback={<Skeleton variant="rectangular" width="100%" height={64} />}>
				<NavBar
					listSource={listSource}
					handleSource={handleSource}
					onMenu={handleDrawer}
					sources={sources}
					setLocale={setLocale}
				/>
			</Suspense>
			<Suspense fallback={<Backdrop open={drawer} onClick={handleDrawer} />}>
				<SettingDrawer
					open={{value: drawer, handler: handleDrawer}}
					userDarkMode={{value: userDarkMode, handler: handleUserDarkMode}}
					quality={{value: quality, handler: handleQuality}}
					considerTime={{value: considerTime, handler: handleConsiderTime}}
					world={{value: world, handler: setWorld}}
					server={{value: server, handler: setServer}}
					priceWindow={{value: priceWindow, handler: setPriceWindow}}
					isLoading={{handler: setShouldUpdate}}
					jobInfo={{value: jobInfo, handler: setJobInfo}}
					locale={{value: locale, handler: setLocale}}
					sortModel={{value: sortModel, handler: handleSort}}
				/>
			</Suspense>
			<StyledMainContainer>
				<Suspense fallback={
					<Skeleton variant="rounded" height="100%" width="100%" />
				}>
					<PinnableDataGrid hideFooterSelectedRowCount {...{
						...gridMemorizeProps,
						rows, columns, pageSize, page, gridFooterContent, sortModel, onSortModelChange: handleSort,
						disableColumnMenu: true,
						sortingOrder: SORTING_ORDER,
						onPageChange: setPage,
						onPageSizeChange: setPageSize,
					}}/>
				</Suspense>
			</StyledMainContainer>
			<MixedRecaptcha
				version={recaptchaVersion}
				onLoad={setExecuteRecaptcha}
				v2Props={v2Props}
				v3Props={v3Props}
			/>
			<Suspense fallback={null}>
				<CopyHint open={clipBarOpen} setOpen={setClipBarOpen} />
			</Suspense>
			<Suspense fallback={<Backdrop open={!!error} />}>
				<ErrorCover open={!!error} {...{retry: retry < RETRY, error}}/>
			</Suspense>
		</>
	);
}


/*export const config = {
	runtime: 'experimental-edge'
};*/


export default whatToSellToday