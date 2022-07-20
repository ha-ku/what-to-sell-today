import {StyledCircularProgress, StyledFormControlLabel} from "./styledComponents";
import {
	Backdrop,
	Box,
	Button,
	Drawer,
	FormControl,
	FormControlLabel,
	FormLabel,
	MenuItem,
	Radio,
	RadioGroup,
	Switch,
	TextField,
	Typography
} from "@mui/material";
import {DownloadForOffline as DownloadForOfflineIcon, Restore as RestoreIcon} from "@mui/icons-material";
import {servers, serversName, worlds, worldsName} from "./worldsAndServers";
import useTranslate from "./useTranslate";
import {memo, useEffect, useState} from "react";
import {exportJSON, importJSON} from "./iojson";

const SERVER = worlds.reduce((a, w, i) => {
		a[w] = servers[i][0];
		return a;
	}, {});

const NUMERIC = new RegExp(/^[0-9]*$/);

const useLocalState = (defaultValue) => {
	const res = useState(defaultValue);
	useEffect(() => res[1](defaultValue), [defaultValue]);
	return res;
}
function SettingDrawer({open, isLoading, locale, sortModel, userDarkMode, quality, considerTime, world: extWorld, server: extServer, priceWindow: extPriceWindow, jobInfo: extJobInfo}) {
	//console.log('rerender SettingDrawer');
	const { t, FormattedMessage } = useTranslate('drawer');

	const [jobInfo, setJobInfo] = useLocalState(extJobInfo.value),
		[world, setWorld] = useLocalState(extWorld.value),
		[server, setServer] = useLocalState(extServer.value),
		[priceWindow, setPriceWindow] = useLocalState(extPriceWindow.value);

	const handleWorld = ({target: {value}}) => {
		setWorld(value);
		setServer(SERVER[value]);
	};
	const handleServer = ({target: {value}}) => setServer(value);

	const [importing, setImporting] = useState(null);
	useEffect(() => {
		if(!importing) return;
		importing.then(settings => {
			Object.keys(settings).forEach(key => {
				switch (key) {
					case 'world':
						setWorld(settings[key]); break;
					case 'server':
						setServer(settings[key]); break;
					case 'priceWindow':
						setPriceWindow(settings[key]); break;
					case 'jobInfo':
						setJobInfo(settings[key]); break;

					case 'userDarkMode':
						userDarkMode.handler({target: {value: settings[key]}}); break;
					case 'quality':
						quality.handler({target: {value: settings[key]}}); break;
					case 'considerTime':
						considerTime.handler({target: {value: settings[key]}}); break;
					case 'locale':
						locale.handler(settings[key]); break;
					case 'sortModel':
						sortModel.handler(settings[key]); break;
				}
			})
			setImporting(null);
		})
	}, [importing]);

	return (
		<Drawer anchor="left" open={open.value} onClose={() => {
			let shouldUpdate = false;
			if(extJobInfo.value !== jobInfo) {
				extJobInfo.handler(jobInfo);
				shouldUpdate = true;
			}
			if(extWorld.value !== world) {
				extWorld.handler(world);
				shouldUpdate = true;
			}
			if(extServer.value !== server) {
				extServer.handler(server);
				shouldUpdate = true;
			}
			if(extPriceWindow.value !== priceWindow) {
				extPriceWindow.handler(priceWindow);
				shouldUpdate = true;
			}
			open.handler();
			shouldUpdate && isLoading.handler(true);
		}} autoWidth PaperProps={{sx: {padding: '20px'}}}>
			<Typography variant="h5" >
				<FormattedMessage id="appearance" />
			</Typography>
			<FormControl sx={{marginTop: '15px', marginLeft: '15px'}} >
				<FormLabel id="theme-label">{t('theme')}</FormLabel>
				<RadioGroup value={userDarkMode.value} onChange={userDarkMode.handler} row aria-labelledby="theme-label" >
					<FormControlLabel control={<Radio color="secondary" size="small" />} label={t('day')} value="light"/>
					<FormControlLabel control={<Radio color="secondary" size="small" />} label={t('night')} value="dark"/>
					<FormControlLabel control={<Radio color="secondary" size="small" />} label={t('auto')} value="auto"/>
				</RadioGroup>
			</FormControl>

			<Typography variant="h5" mt={3} >
				<FormattedMessage id="calculationParam" />
			</Typography>
			<FormControl sx={{marginTop: '15px', marginLeft: '15px'}} >
				<FormLabel id="quality-label">{t('quality')}</FormLabel>
				<RadioGroup value={quality.value} onChange={quality.handler} row aria-labelledby="quality-label" >
					<FormControlLabel control={<Radio color="secondary" size="small" />} label={t('HQ')} value="hq"/>
					<FormControlLabel control={<Radio color="secondary" size="small" />} label={t('NQ')} value="nq"/>
					<FormControlLabel control={<Radio color="secondary" size="small" />} label={t('all')} value="all"/>
				</RadioGroup>
				<StyledFormControlLabel label={t('considerTime')} labelPlacement="top" control={
					<Switch color="secondary" checked={considerTime.value} onChange={considerTime.handler} sx={{marginLeft: '-12px'}}/>
				} sx={{marginLeft: 0}}/>
				<TextField fullWidth label={t('averageWindowSize')} value={priceWindow} onChange={({target: {value}}) => {
					const window = Number(value)
					setPriceWindow((value.length && (isNaN(window) || window <= 0 || window >= 10)) ? undefined : value);
				}} variant="standard" margin="dense" sx={{width: '160px'}}/>
			</FormControl>

			<Typography variant="h5" mt={3} >
				<FormattedMessage id="retainerInfo" />
			</Typography>
			<FormControl sx={{marginTop: '15px', marginLeft: '15px'}} >
				<Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start'}} >
					{Object.keys(jobInfo).map((job) => (
						<StyledFormControlLabel label={t(job)} labelPlacement="top" control={
							<Box key={job} sx={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start'}} >
								{Object.keys(jobInfo[job]).map((key, i) => (
									<TextField key={key} label={t(key)} value={jobInfo[job][key]} onChange={
										({target: {value}}) => NUMERIC.test(value) ? setJobInfo((jobInfo) => ({ ...jobInfo, [job]: {...(jobInfo[job]), [key]: value} })) : null
									} variant="standard" size="small" sx={{width: '100px', marginRight: i === Object.keys(jobInfo[job]).length - 1 ? '0px' : '10px'}} />
								))}
							</Box>
						} sx={{marginX: 0}}/>
					))}
				</Box>
			</FormControl>

			<Typography variant="h5" mt={3} >
				<FormattedMessage id="characterInfo" />
			</Typography>
			<FormControl sx={{marginTop: '15px', marginLeft: '15px'}} >
				<Box sx={{display: "flex", flexDirection: "row", justifyContent: "flex-start"}}>
					<TextField select label={t('DC')} value={world} onChange={handleWorld} variant="standard" margin="dense" sx={{marginRight: "10px"}}>{
						worlds.map((world, i) =>
							(<MenuItem value={world} key={world}>
								{worldsName[i]}
							</MenuItem>)
						)
					}</TextField>
					<TextField select label={t('world')} value={server} onChange={handleServer} variant="standard" margin="dense">{
						servers[worlds.indexOf(world)].map((server, i) =>
							(<MenuItem value={server} key={server}>
								{serversName[worlds.indexOf(world)][i]}
							</MenuItem>)
						)
					}</TextField>
				</Box>
			</FormControl>

			<Box sx={{flex: '1 1 auto'}} />

			<Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
				<Button variant="text" startIcon={<DownloadForOfflineIcon />} onClick={() => {
					let settings = {
						userDarkMode: userDarkMode.value,
						quality: quality.value,
						considerTime: considerTime.value,
						locale: locale.value,
						sortModel: sortModel.value,
						world, server, priceWindow, jobInfo
					};
					exportJSON(settings, 'wtst_settings.json')
				}}>
					<FormattedMessage id="export" />
				</Button>
				<Button variant="text" startIcon={<RestoreIcon />} onClick={() => setImporting(importJSON())}>
					<FormattedMessage id="import" />
				</Button>
			</Box>
			<Backdrop open={!!importing}>
				<StyledCircularProgress />
			</Backdrop>
		</Drawer>
	);
}
const areEqual = (p, n) => {
	if(Object.keys(p).length !== Object.keys(n).length) return false;
	return Object.keys(p).every(k => {
		//if(!res) console.log(k, p[k], n[k])
		return p[k] === n[k] || (p[k].value === n[k].value && p[k].handler === n[k].handler);
	})
}

export default memo(SettingDrawer, areEqual)