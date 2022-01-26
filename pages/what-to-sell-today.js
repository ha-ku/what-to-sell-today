import { useState, useEffect, useMemo} from 'react';
import Head from 'next/head';

import { Close as CloseIcon,AccessTime as AccessTimeIcon} from '@mui/icons-material';
import { MenuItem, FormControlLabel, RadioGroup, Radio, Switch, TextField, Button, Link,
	Tooltip, IconButton, Drawer, Divider, Typography, Snackbar, useTheme, Box } from '@mui/material';

import dynamic from "next/dynamic.js";
const DataGrid = dynamic(() =>
	import("@mui/x-data-grid").then(({DataGrid}) => DataGrid)
);

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


import {worlds, worldsName, servers, serversName } from '../modules/worldsAndServers';
import {StyledCellSub, StyledIcon, StyledIconButton, StyledCellContainer, StyledFormControlLabel, StyledGridContainer, StyledCircularProgress, StyledButton, StyledFormControl} from '../modules/styledComponents'
import ErrorCover from "../modules/ErrorCover";
import NavBar from "../modules/NavBar";
import SettingDrawer from "../modules/SettingDrawer";

const fix = (num) => Number(num.toFixed(1)),
	getDefaultHistPerCost = (params) =>
		params.getValue(params.id, 'defaultHistLow') === NONE ? NONE :
			fix(params.getValue(params.id, 'defaultHistLow') / params.getValue(params.id, 'cost')),
	getHistPerCost = (params) =>
		params.getValue(params.id, 'histLow') === NONE ? NONE :
			fix(params.getValue(params.id, 'histLow') / params.getValue(params.id, 'cost')),
	lowestToString = ({price, quantity, seller}) => `${price} ( x${quantity} ${seller})`,
	lowestComparator = (v1, v2) =>
		v1 === NONE ? -1 :
			v2 === NONE ? 1 :
				v1.split(' ')[0] - v2.split(' ')[0],
	renderVolumns = (params) =>
		params.value === NONE ? NONE : (
			<StyledCellContainer>{
				params.value.map((_, i) => (
					<StyledCellSub key={i}>
						{params.value[i]}
					</StyledCellSub>
				))
			}</StyledCellContainer>
		)

const NONE = '无',
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
	HOSTS = ['e6faa6744fbfd5fadfe45dd88b2fc9940be6a585cee47fcb4d0011e1945d6001', 'b65abeda15fa797363ac9525271da0d3a51d8926e57dd030afea8540362f2394']

function whatToSellToday({userDarkMode, setUserDarkMode}){

	const [reports, setReports] = useState([]),
		[priceWindow, handlePriceWindow] = useHandler(PRICE_WINDOW, ({target: {value}}) => {
		const window = Number(value)
		return (value.length && (isNaN(window) || window <= 0 || window >= 10)) ? undefined : value;
	}, 'priceWindow'),
		[world, setWorld] = useLocalStorageState('world', WORLD),
		[server, setServer] = useLocalStorageState('server', SERVER[WORLD]),
		[quality, handleQuality] = useHandler(QUALITY, ({target: {value}}) => value, 'quality'),
		[considerTime, handleConsiderTime] = useHandler(CONSIDER_TIME, ({target: {checked}}) => checked, 'considerTime'),
		[listSource, handleSource] = useHandler(SOURCE, ({target: {value}}) => {
			if(isLoading) {
				console.log('restart request');
				request?.abort();
				setRequest(null);
				setShouldUpdate(false);
			}
			setTimeout(() => {
				setPage(0);
				setReports([]);
				handleUpdate();
			}, 20);
			return value;
		}, 'source'),
		[sortModel, handleSort] = useHandler(undefined, gridSort =>
				sortModel => JSON.stringify(gridSort) === JSON.stringify(sortModel) ?
					sortModel
					: gridSort
			, 'sortModel');

	const [isLoading, setShouldUpdate] = useState(true),
		[request, setRequest] = useState(null),
		[error, setError] = useState(null),
		[retry, setRetry] = useState(0),
		[fetchingURL, setURL] = useState(null);

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
	const pageSize = height ? Math.max(Math.floor((height - 230) / 52), 5) : 5;

	const handlePage = newPage => setPage(newPage);
	useHotkeys('left,alt+a', () => setPage(page => Math.max(page-1, 0)));
	useHotkeys('right,alt+d', () => setPage(page => Math.min(page+1, Math.ceil(reports.length / pageSize) - 1)), [reports, pageSize]);

	const handleCopy = ({target: {innerText}}) =>
		navigator.clipboard.writeText(innerText).then(() => setClipBarOpen(true))


	const dateFormat = Intl.DateTimeFormat('zh-CN', {year:"2-digit", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hour12: false});
	const columns = useMemo(() => [
		{field: "name", headerName: "物品", width: 300, sortable: false,
			renderCell: (params) => (<>
				<StyledIconButton size="small">
					<Link target="_blank" href={`https://universalis.app/market/${params.id}`} rel="noopener noreferrer">
						<StyledIcon render={UniIcon} fill={theme.palette.mode === 'dark' ? '#c2d0ff': '#86A2FF'} viewBox="0 0 145.9 68.5"/>
					</Link>
				</StyledIconButton>
				<StyledIconButton size="small">
					<Link target="_blank" href={`https://ff14.huijiwiki.com/wiki/物品:${params.value}`} rel="noopener noreferrer">
						<StyledIcon render={HuijiIcon} fill={theme.palette.mode === 'dark' ? '#ffffff' : '#333333'} viewBox="0 0 135.55 61.26"/>
					</Link>
				</StyledIconButton>
				<Button variant="text" onClick={handleCopy} sx={{minWidth: 0}}>{params.value}</Button>
				{itemList.length > 0 && itemList[0].level !== undefined ? ` (${params.getValue(params.id, "level")}级)` : null}
				<Box sx={{ flexGrow: 1 }} />
				<Tooltip title={<p>
					数据上传时间<br />
					本服：{dateFormat.format(params.getValue(params.id, "defaultLastUploadTime"))}<br />
					全服：{dateFormat.format(params.getValue(params.id, "lastUploadTime"))}
				</p>} placement="right">
					<AccessTimeIcon />
				</Tooltip>
			</>)
		},
		...((itemList.length > 0 && itemList[0].level) ? [{field: "level", headerName: "等级", width: 86, hide: true}] : []),
		{field: "cost", headerName: "成本", width: 62, sortable: false},
		{field: "defaultLowest", headerName: "本服最低", width: 160, cellClassName: "default-server",
			headerClassName: "default-server", sortComparator: lowestComparator},
		{field: "defaultMeanLow", headerName: "平均低价", width: 119, cellClassName: "default-server",
			headerClassName: "default-server"},
		{field: "defaultHistLow", headerName: "成交均价", width: 119, cellClassName: "default-server",
			headerClassName: "default-server"},
		{field: "defaultHistPerCost", headerName: "单位成本价", width: 134, cellClassName: "default-server",
			headerClassName: "default-server", valueGetter: getDefaultHistPerCost},
		{field: "defaultVolumns", headerName: "1/3/7日成交", width: 150, cellClassName: "default-server",
			headerClassName: "default-server", sortable: false, renderCell: renderVolumns},
		{field: "lowest", headerName: "全服最低价", width: 160, sortComparator: lowestComparator},
		{field: "meanLow", headerName: "平均低价", width: 119},
		{field: "histLow", headerName: "成交均价", width: 119},
		{field: "histPerCost", headerName: "单位成本价", width: 134, valueGetter: getHistPerCost},
		{field: "volumns", headerName: "1/3/7日成交", width: 150, sortable: false, renderCell: renderVolumns}
	], [itemList, theme]);

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
			let decoder = reportDecoder(),
				controller = new AbortController(),
				cache = [],
				updateHandlerID = null;
			setRequest(controller);
			const updateHandler = () => {
				if(cache.length > 0) {
					setReports(reports => {
						let newRep = [...reports];
						cache.forEach(rep => {
							let i = reports.findIndex(r => r.ID === rep.ID);
							if (i === -1)
								newRep.push(rep);
							else
								newRep[i] = rep;
						})
						return newRep;
					});
					cache = [];
				}
				updateHandlerID = null;
			}
			decoder.on('data', (message) => {
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
			});
			decoder.on('end', () => {
				setShouldUpdate(false);
				setRequest(null);
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
				let url = `${HOSTS.some(h => h === host) ? window.location.origin : 'https://aws-cf.ha-ku.cyou' }/marketReport?${Object.entries(query).filter(pair => pair[1].length).map(pair =>  pair.join('=')).join('&')}`
				setURL(url);
				console.log('controller aborted', controller.signal.aborted);
				try {
					let response = await window.fetch(url, {signal: controller.signal})
					console.log('controller aborted', controller.signal.aborted);
					let reader = response.body.getReader();
					reader.read().then(function onData({done, value}) {
						if (done) {
							decoder.end();
							return;
						}
						decoder.write(value);
						reader.read().then(onData)
					})
				} catch(err) {
					setError(err);
				};
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
				request?.abort();
				setRequest(null);
			}
		}
	}, [isLoading, executeRecaptcha, recaptchaVersion]);

	const rows = useMemo(() => fullReports.map((rep) => ({
		id: rep.ID,
		name: rep.name,
		cost: fix(rep.cost),
		defaultLowest: rep.defaultServer[quality]?.lowestPrice ? lowestToString(rep.defaultServer[quality].lowestPrice) : NONE,
		defaultMeanLow: rep.defaultServer[quality]?.meanLowPrice ? fix(rep.defaultServer[quality].meanLowPrice) : NONE,
		defaultHistLow: rep.defaultServer[quality]?.meanLowHistoryPrice ? fix(rep.defaultServer[quality].meanLowHistoryPrice) : 0,
		defaultVolumns: rep.defaultServer[quality] ? rep.defaultServer[quality].volumns : NONE,
		lowest: rep[quality]?.lowestPrice ? lowestToString(rep[quality].lowestPrice) : NONE,
		meanLow: rep[quality]?.meanLowPrice ? fix(rep[quality].meanLowPrice): NONE,
		histLow: rep[quality]?.meanLowHistoryPrice ? fix(rep[quality].meanLowHistoryPrice) : 0,
		volumns: rep[quality] ? rep[quality].volumns : NONE,
		lastUploadTime: rep.lastUploadTime,
		defaultLastUploadTime: rep.defaultServer.lastUploadTime,
		...(rep.level !== undefined ? {level : rep.level} : {} )
	})), [fullReports]);

	if(error) {
		if(retry < 3) {
			setRetry(retry => retry + 1);
			setTimeout(() => {
				setError(null);
				setShouldUpdate(true);
			}, 2500);
		}
		return (<ErrorCover {...{retry, error}}/>);
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
					(<DataGrid {...{
						rows, columns,
						pageSize,
						disableColumnMenu: true,
						sortingOrder: SORTING_ORDER,
						onSortModelChange: handleSort,
						page,
						onPageChange: handlePage,
						...(sortModel ? {sortModel} : {})
					}}/>) : <StyledCircularProgress color="secondary" thickness={4.8}/>}
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