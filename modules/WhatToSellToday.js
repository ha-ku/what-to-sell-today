import {useState, useEffect, useMemo, startTransition, useCallback, Suspense, lazy} from 'react';

import {Skeleton, Backdrop} from '@mui/material';
import {useTheme} from '@mui/material/styles';


import { useHotkeys } from "react-hotkeys-hook";
import useLocalStorageState from "use-local-storage-state";

import MixedRecaptcha from "./MixedRecaptcha";
import useHandler from "./useHandler";
import Pbf from 'pbf';
import {Report} from '../backend/protobuf/MarketReport';
import lpstream from "../backend/modules/lengthPrefixedWebstream.mjs";


import {worlds, servers, worldsName, serversName} from './worldsAndServers';
import useRem from "./useRem";
import useTranslate from "./useTranslate";
import {v2, v3} from "./recaptchaPublicKey";
import {StyledMainContainer} from "./styledComponents";
import {colord} from "colord";

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
	ENDPOINTS = process.env.NEXT_PUBLIC_WTST_ENDPOINTS.split(' '),
	SOURCE_INFO = Object.fromEntries(Object.entries({
		companySeal: {withTime: false, category: 'category.currency'},
		wolfMark: {withTime: false, category: 'category.currency'},
		botany: {withTime: true, category: 'category.retainer'},
		mining: {withTime: true, category: 'category.retainer'},
		fish: {withTime: true, category: 'category.retainer'},
		hunting: {withTime: true, category: 'category.retainer'},
		dye: {withTime: false, category: 'category.crafting'},
		map: {withTime: false, category: 'category.gathering'},
		whiteGathererScrips: {withTime: false, category: 'category.gathering'},
		whiteCrafterScrips: {withTime: false, category: 'category.crafting'},
		khloeBronze: {withTime: false, category: 'category.wondrousTail'},
		khloeSilver: {withTime: false, category: 'category.wondrousTail'},
		khloeGold: {withTime: false, category: 'category.wondrousTail'},
		poetics: {withTime: false, category: 'category.currency'},
	}).map(([source, value]) => [source, {
		...value,
		target:`${source}.source`,
		action: `${source}.action`
	}] ));

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

	const [reports, setReports] = useState(new Map()),
		[sourceLength, setSourceLength] = useState(Number.MAX_SAFE_INTEGER),
		[priceWindow, setPriceWindow] = useLocalStorageState('priceWindow', {ssr: true, defaultValue: PRICE_WINDOW}),
		[world, setWorld] = useLocalStorageState('world', {ssr: true, defaultValue: WORLD}),
		[server, setServer] = useLocalStorageState('server', {ssr: true, defaultValue: SERVER[WORLD]}),
		[quality, handleQuality] = useHandler(QUALITY, ({target: {value}}) => value, 'quality'),
		[considerTime, handleConsiderTime] = useHandler(CONSIDER_TIME, ({target: {checked}}) => checked, 'considerTime'),
		[listSource, handleSource] = useHandler(SOURCE, ({target: {value}}) => {
			setReports(new Map());
			setSourceLength(Number.MAX_SAFE_INTEGER);
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
		, []);

	const theme = useTheme();

	const [jobInfo, setJobInfo] = useLocalStorageState("jobInfo", {
		ssr: true,
		defaultValue: JOB_INFO
	});


	let rows = useMemo(() => {
		//console.log('recalculate cost')
		const job = jobInfo[listSource];
		if(!job)
			return [...reports.entries()].map(([, item]) => item);
		return [...reports.entries()].filter(([, item]) =>
			(item.level <= job.level) && !(item.threshold > (job.gathering ?? job.averageItemLevel))
		).map(([, item]) => ({
			...item,
			cost: (considerTime ? getActualTime(job, item) : 60) / getactualAmount(job, item)
		}))
	}, [reports, jobInfo[listSource], considerTime]);
	useHotkeys('f5', (event) => {
		if(!error && !isLoading) {
			event.preventDefault();
			setShouldUpdate(true);
		}
	}, [error, isLoading]);


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
						withTime={SOURCE_INFO[listSource].withTime}
						id={params.id}
						value={params.value}
						enName={params.row.enName}
						level={params.row.level}
						defaultLastUploadTime={params.row.defaultLastUploadTime}
						lastUploadTime={params.row.lastUploadTime}
						onClick={doCopy}
						primary={theme.palette.text.primary}
						warning={theme.palette.warning.main}
					/>
				</Suspense>),
			pin: 'left'
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
						upperBound={params.row.defaultMeanLow}
						lowerBound={params.row.defaultLowest?.price}
						valueFormatter={noneOrFix}
					/>
				</Suspense>),
			sortComparator: lowestComparator},
		{field: "defaultHistPerCost", headerName: t('defaultHistPerCost'), width: 54 + 5 * 0.875 * rem,
			cellClassName: "default-server", headerClassName: "default-server",
			valueGetter: (params) => {
				let price = params.row.defaultHistLow;
				return isNaN(price) ? undefined : (price / params.row.cost);
			}, sortComparator: lowestComparator, valueFormatter: noneOrFix},
		{field: "defaultVolumes", headerName: t('volumes'), width: 150,
			cellClassName: "default-server", headerClassName: "default-server",
			sortable: false, renderCell: ({value}) => value?.length ?
				(<Suspense fallback={<Skeleton variant="text" />}>
					<ItemVolumns
						value={value}
						height={52}
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
						upperBound={params.row.meanLow}
						lowerBound={params.row.lowest?.price}
						valueFormatter={noneOrFix}
					/>
				</Suspense>),
			sortComparator: lowestComparator, valueFormatter: noneOrFix},
		{field: "histPerCost", headerName: t('histPerCost'), width: 54 + 5 * 0.875 * rem,
			valueGetter: (params) => {
				let price = params.row.histLow;
				return isNaN(price) ? undefined : (price / params.row.cost);
			}, sortComparator: lowestComparator, valueFormatter: noneOrFix},
		{field: "volumes", headerName: t('volumes'), width: 150,
			sortable: false, renderCell: ({value}) => value?.length ?
				(<Suspense fallback={<Skeleton variant="text" />}>
					<ItemVolumns
						value={value}
						height={52}
						color={theme.palette.primary.main}
						darkMode={theme.palette.mode === 'dark'}
					/>
				</Suspense>) : NONE
		}
	]), [SOURCE_INFO[listSource].withTime, rem, theme]);
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

			let controller = new AbortController(),
				decoder = lpstream.decode(),
				reader = decoder.readable.getReader();

			(async () =>{
				const [_JSON, _token] = await Promise.allSettled([
					import(`../public/json/itemLists/${listSource}.json`).then(({default: v}) => v),
					executeRecaptcha('marketReport')
				]);
				const source = _JSON.value, token = _token.value;
				setSourceLength(source.length);
				if (_JSON.reason) {
					console.log('fetch source error:', _token.reason);
					setError({code: '000', content: _JSON.reason});
					return;
				}
				if (_token.reason) {
					console.log('recaptcha error:', _token.reason);
					setError({code: '000', content: _token.reason});
					return;
				}

				let query = {
					world, server, priceWindow, token,
					qual: quality,
					itemListName: listSource + 'List',
					recaptchaVersion: 'v' + recaptchaVersion,
				}
				let url = `https://${ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)]}-cf.ha-ku.cyou/marketReportPbfCfProxy?${
					Object.entries(query).filter(pair => pair[1] !== null && typeof pair[1] !== 'undefined')
						.map(pair => pair.join('=')).join('&')
				}`
				async function onData({done, value: _message}) {
					if (done) {
						setShouldUpdate(false);
						setRetry(0);
						setProgress(0);
						setBuffer(0);
						return;
					}
					const message = Report.read(new Pbf(_message))
					console.log(message);
					if (message.err) {
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
					setBuffer(b => b + 1);
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
						setProgress(p => p + 1);
					});
					return onData(await reader.read());
				}
				try {
					let response = await window.fetch(url, {signal: controller.signal});
					reader.read().then(onData);
					await response.body.pipeTo(decoder.writable);
				} catch (err) {
					if (err.code !== 20)
						setError(err);
				}
			})()

			return () => {
				//console.log('effect callback');
				controller.abort();
			}
		}
	}, [isLoading, listSource, executeRecaptcha, recaptchaVersion, world, server, priceWindow, quality]);


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

	return (
		<>
			<Suspense fallback={<Skeleton variant="rectangular" width="100%" height={4} sx={{position: "fixed", top: 0, left: 0, width: '100%', zIndex: 2000}} />}>
				{isLoading ?
					<LinearProgress
						variant="buffer"
						value={progress / sourceLength * 100}
						valueBuffer={buffer / sourceLength * 100}
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
					sources={SOURCE_INFO}
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
			<StyledMainContainer sx={{margin: "20px 10px 10px"}} defaultColor={colord(theme.palette.secondary.main).alpha(0.2).toHex()}>
				<Suspense fallback={
					<Skeleton variant="rounded" height="100%" width="100%" />
				}>
					<PinnableDataGrid hideFooterSelectedRowCount {...{
						rows, columns, gridFooterContent,
						sortModel, onSortModelChange: handleSort,
						disableColumnMenu: true,
						sortingOrder: SORTING_ORDER,
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