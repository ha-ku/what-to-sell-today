import {useState, useEffect, useMemo, startTransition, useCallback, Suspense, lazy} from 'react';

import {Skeleton, Backdrop, Fade} from '@mui/material';
import {useTheme} from '@mui/material/styles';


import { useHotkeys } from "react-hotkeys-hook";

import MixedRecaptcha from "./MixedRecaptcha";
import Pbf from 'pbf';
import {readReport} from '../backend/protobuf/MarketReport.mjs';
import lpstream from "../backend/modules/lengthPrefixedWebstream.mjs";


import {worlds, servers, worldsName, serversName} from './worldsAndServers';
import useRem from "./useRem";
import useTranslate from "./useTranslate";
import {v2, v3} from "./recaptchaPublicKey";
import {StyledMainContainer} from "./styledComponents";
import {colord} from "colord";
import {useSelector, useDispatch} from "react-redux";
import {configAction, configSelectors} from "./config/configSlice";
import {reportAction, reportSelectors} from "./report/reportSlice";
import ItemLowest from "./itemLowest";

const ErrorCover = lazy(() => import('./ErrorCover'));
const NavBar = lazy(() => import('./NavBar'));
const ItemName = lazy(() => import('./ItemName'));
const ItemMeanLow = lazy(() => import('./ItemMeanLow'));
const ItemVolumns = lazy(() => import('./ItemVolumns'));
const LinearProgress = lazy(() => import('@mui/material/LinearProgress'));
const CopyHint = lazy(() => import('./CopyHint'));
const PinnableDataGrid = lazy(() => import('./PinnableDataGrid'));


const SORTING_ORDER = ['desc', 'asc', null],
	ENDPOINTS = process.env.NEXT_PUBLIC_WTST_ENDPOINTS.split(' ');

const lowestComparator = (v1, v2) =>
		isNaN(v1) ? -1 :
			isNaN(v2) ? 1 :
				v1 - v2;

const getActualTime = (job, item) => (60 - Math.min(Math.floor(Math.max(job.level-item.level, 0) / 10), 2) * 10)
const getactualAmount = ({perception, averageItemLevel}, item) => {
	const levels = Object.keys(item.amount).map(n => Number(n))
	return item.amount[Math.max( ...(levels.filter(n => n <= (perception ?? averageItemLevel))) )]
}
const withSuspense = (renderer, fallbackToTextSkeleton) => (
	args =>
	(<Suspense {...(fallbackToTextSkeleton ? {fallback: <Skeleton variant="text" />} : {})}>
		{renderer(args)}
	</Suspense>)
)

function whatToSellToday(){

	const [reports, setReports] = useState(new Map()),
		sourceLength = useSelector(reportSelectors.sourceLength),
		priceWindow = useSelector(configSelectors.priceWindow),
		world = useSelector(configSelectors.world),
		server = useSelector(configSelectors.server),
		quality = useSelector(configSelectors.quality),
		considerTime = useSelector(configSelectors.considerTime),
		listSource = useSelector(reportSelectors.listSource);

	const update = useSelector(reportSelectors.update),
		error = useSelector(reportSelectors.error),
		[queryInfo, setQueryInfo] = useState({
			worldName: worldsName[worlds.indexOf(world)],
			serverName: serversName[worlds.indexOf(world)][servers[worlds.indexOf(world)].indexOf(server)]
		});

	const progress = useSelector(reportSelectors.progress);

	const [clipBarOpen, setClipBarOpen] = useState(false),
		doCopy = useCallback(({target: {innerText}}) =>
			navigator.clipboard.writeText(innerText).then(() => setClipBarOpen(true))
		, []);

	const theme = useTheme();

	const jobInfo = useSelector(configSelectors.jobInfo);


	let rows = useMemo(() => {
		//console.log('recalculate cost')
		const job = jobInfo[listSource.name];
		if(!job)
			return [...reports.entries()].map(([, item]) => item);
		return [...reports.entries()].filter(([, item]) =>
			(item.level <= job.level) && !(item.threshold > (job.gathering ?? job.averageItemLevel))
		).map(([, item]) => ({
			...item,
			cost: (considerTime ? getActualTime(job, item) : 60) / getactualAmount(job, item)
		}))
	}, [reports, jobInfo[listSource.name], considerTime]);
	useHotkeys('f5', (event) => {
		if(!error && !update) {
			event.preventDefault();
			dispatch(reportAction.startUpdate());
		}
	}, [error, update]);


	const { t ,locale } = useTranslate('grid'),
		noneOrFix = (value) => (isNaN(value) || value === null || value === 0) ? t('none') : Number(value.toFixed(1));
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
	const defaultServerClass = {cellClassName: "default-server", headerClassName: "default-server"};
	const columns = useMemo(() => ([
		{field: "name", headerName: t('item'), width: 105 + 0.875*rem*8, sortable: false,
			renderCell: withSuspense((params) =>
				(<ItemName
						withTime={listSource.withTime}
						id={params.id}
						value={params.value}
						enName={params.row.enName}
						level={params.row.level}
						defaultLastUploadTime={params.row.defaultLastUploadTime}
						lastUploadTime={params.row.lastUploadTime}
						onClick={doCopy}
					/>), true),
			pin: 'left'
		},
		{field: "cost", headerName: t('cost'), width: 21 + 5 * 0.52 * 0.875 * rem, sortable: false,
			valueFormatter: (value) => Number(value.toFixed(3))},
		{field: "defaultLowest", headerName: t('defaultLowest'), width: 94, ...defaultServerClass,
			sortComparator: (v1, v2) => lowestComparator(v1?.price, v2?.price),
			renderCell: withSuspense((params) => params.row.defaultLowest ?
				(<ItemLowest {...params.row.defaultLowest} color="secondary" />)
				: t('none')
			, true)
		},
		{field: 'defaultMeanLow', headerName: t('meanLow'), width: 41 + 2*8*0.52*rem, ...defaultServerClass,
			sortable: false,
			renderCell: withSuspense((params) =>
				(<ItemMeanLow
						value={params.row.defaultMeanLow}
						hist={params.row.defaultHistLow}
						lowest={params.row.defaultLowest?.price}
						valueFormatter={noneOrFix}
					/>
				), true)
		},
		{field: "defaultHistPerCost", headerName: t('histPerCost'), width: 54 + 5 * 0.875 * rem, ...defaultServerClass,
			valueGetter: (_, row) => isNaN(row.defaultHistLow) ?
				undefined
				: (row.defaultHistLow / row.cost),
			sortComparator: lowestComparator, valueFormatter: noneOrFix},
		{field: "defaultDailyVolumns", headerName: t('dailyRevenue'), width: 54 + 4 * 0.875 * rem, ...defaultServerClass,
			valueGetter: (_, row) => isNaN(row.defaultHistLow) ?
				undefined
				: (row.defaultHistLow / row.cost) * row.defaultVolumes[row.defaultVolumes.length-1] / 7,
			sortComparator: lowestComparator, valueFormatter: noneOrFix},
		{field: "defaultVolumes", headerName: t('volumes'), width: 21 + 3*6*0.52*0.875*rem, ...defaultServerClass,
			sortable: false, renderCell: withSuspense(({value}) => (value?.length ?
					(<ItemVolumns
							value={value}
							height={52} width={21 + 3*6*0.52*0.875*rem}
							color={theme.palette.secondary.main}
							darkMode={theme.palette.mode === 'dark'}
						/>
					) : t('none'))
				, true)
		},
		{field: "lowest", headerName: t('lowest'), width: 94,
			sortComparator: (v1, v2) => lowestComparator(v1.price, v2.price),
			renderCell: withSuspense((params) => (params.row.lowest ?
					(<ItemLowest {...params.row.lowest} color="primary" />)
					: t('none'))
				, true)
		},
		{field: 'meanLow', headerName: t('meanLow'), width: 41 + 2*8*0.52*rem,
			sortable: false,
			renderCell: withSuspense((params) =>
				(<ItemMeanLow
						value={params.row.meanLow}
						hist={params.row.histLow}
						lowest={params.row.lowest?.price}
						valueFormatter={noneOrFix}
					/>
				), true)
		},
		{field: "histPerCost", headerName: t('histPerCost'), width: 54 + 5 * 0.875 * rem,
			valueGetter: (_, row) =>
				isNaN(row.histLow) ?
					undefined
					: (row.histLow / row.cost)
			, sortComparator: lowestComparator, valueFormatter: noneOrFix},
		{field: "dailyVolumns", headerName: t('dailyRevenue'), width: 54 + 4 * 0.875 * rem,
			valueGetter: (_, row) => isNaN(row.histLow) ?
				undefined
				: (row.histLow / row.cost) * row.volumes[row.volumes.length-1] / 7,
			sortComparator: lowestComparator, valueFormatter: noneOrFix},
		{field: "volumes", headerName: t('volumes'), width: 21 + 3*6*0.52*0.875*rem,
			sortable: false, renderCell: withSuspense(({value}) => (value?.length ?
					(<ItemVolumns
						value={value}
						height={52} width={21 + 3*6*0.52*0.875*rem}
						color={theme.palette.primary.main}
						darkMode={theme.palette.mode === 'dark'}
					/>) : t('none'))
				, true)
		}
	]), [listSource.withTime, rem, theme]);
	const sortModel = useSelector(configSelectors.sortModel),
		{setSortModel} = configAction,
		dispatch = useDispatch(),
		handleSort = useMemo(() => (sort) => dispatch(setSortModel(sort)), [dispatch, setSortModel]);

	useEffect(() => {
		if(update && executeRecaptcha) {
			if(update === 2){
				setReports(new Map());
			}
			setQueryInfo({
				worldName: worldsName[worlds.indexOf(world)],
				serverName: serversName[worlds.indexOf(world)][servers[worlds.indexOf(world)].indexOf(server)]
			})

			let controller = new AbortController(),
				decoder = lpstream.decode(),
				reader = decoder.readable.getReader();

			(async () =>{
				const [_JSON, _token] = await Promise.allSettled([
					import(`../public/json/itemLists/${listSource.name}.json`).then(({default: v}) => v),
					executeRecaptcha('marketReport')
				]);
				const source = _JSON.value, token = _token.value;
				dispatch(reportAction.setSourceLength(source.length));
				if (_JSON.reason) {
					console.log('fetch source error:', _JSON.reason);
					dispatch(reportAction.handleError({code: '000', content: _JSON.reason}));
					return;
				}
				if (_token.reason) {
					console.log('recaptcha error:', _token.reason);
					dispatch(reportAction.handleError({code: '000', content: _token.reason}));
					return;
				}

				let query = {
					world, server, priceWindow, token,
					qual: quality,
					itemListName: listSource.name + 'List',
					recaptchaVersion: 'v' + recaptchaVersion,
				}
				let url = `https://${ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)]}-cf.ha-ku.cyou/marketReportPbfCfProxy?${
					Object.entries(query).filter(pair => pair[1] !== null && typeof pair[1] !== 'undefined')
						.map(pair => pair.join('=')).join('&')
				}`
				async function onData({done, value: _message}) {
					if (done) {
						dispatch(reportAction.finishUpdate(false));
						return;
					}
					const message = readReport(new Pbf(new Uint8Array(_message)))
					console.log(message);
					if (message.err) {
						if (message.err.code === 403 && recaptchaVersion === 3) {
							setExecuteRecaptcha({execute: null});
							setRecaptchaVersion(2);
						} else {
							dispatch(reportAction.handleError(message.err));
						}
						return;
					}
					dispatch(reportAction.incrementProgress({received: 1}));
					startTransition(() => {
						setReports(r =>
							new Map(r.set(message.ID, {
								...(source.find(item => item.ID === message.ID)),
								...message,
								id: message.ID,
								defaultLastUploadTime: message.defaultServer.lastUploadTime,
								defaultLowest: message.defaultServer[quality]?.lowestPrice,
								defaultMeanLow: message.defaultServer[quality]?.meanLowPrice,
								defaultHistLow: message.defaultServer[quality]?.meanLowHistoryPrice,
								defaultVolumes: message.defaultServer[quality]?.volumns,
								lowest: message[quality]?.lowestPrice,
								meanLow: message[quality]?.meanLowPrice,
								histLow: message[quality]?.meanLowHistoryPrice,
								volumes: message[quality]?.volumns,
							}))
						);
						dispatch(reportAction.incrementProgress({parsed: 1}));
					});
					return onData(await reader.read());
				}
				try {
					let response = await window.fetch(url, {signal: controller.signal});
					reader.read().then(onData);
					await response.body.pipeTo(decoder.writable);
				} catch (err) {
					if (err.code !== 20)
						dispatch(reportAction.handleError(err));
				}
			})()

			return () => {
				//console.log('effect callback');
				controller.abort();
			}
		}
	}, [update, listSource, executeRecaptcha, recaptchaVersion, world, server, priceWindow, quality]);


	const gridFooterContent = `"${queryInfo.worldName} ${queryInfo.serverName}"`

	return (
		<>
			<Suspense fallback={<Skeleton variant="rectangular" width="100%" height={4} sx={{position: "fixed", top: 0, left: 0, width: '100%', zIndex: 2000}} />}>
				<Fade in={update} enter={false} unmountOnExit >
					<LinearProgress
						variant="buffer"
						value={progress.parsed / sourceLength * 100}
						valueBuffer={progress.received / sourceLength * 100}
						color="secondary"
						sx={{position: "fixed", top: 0, left: 0, width: '100%', zIndex: 2000
						}}
					/>
				</Fade>
			</Suspense>
			<Suspense fallback={<Skeleton variant="rectangular" width="100%" height={64} />}>
				<NavBar listSource={listSource} />
			</Suspense>
			<StyledMainContainer sx={{margin: "20px 10px 10px"}} defaultColor={colord(theme.palette.secondary.main).alpha(0.2).toHex()}>
				<Suspense fallback={
					<Skeleton variant="rounded" height="100%" width="100%" />
				}>
					<PinnableDataGrid hideFooterSelectedRowCount {...{
						rows, columns, gridFooterContent,
						onSortModelChange: handleSort,
						disableColumnMenu: true,
						sortingOrder: SORTING_ORDER,
						...(sortModel ? {sortModel} : {})
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
				<ErrorCover/>
			</Suspense>
		</>
	);
}


/*export const config = {
	runtime: 'experimental-edge'
};*/
export default whatToSellToday