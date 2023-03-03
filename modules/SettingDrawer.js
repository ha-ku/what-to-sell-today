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
import {useDispatch, useSelector} from "react-redux";
import {configAction, configSelectors} from "./config/configSlice";



const NUMERIC = new RegExp(/^[0-9]*$/);


function SettingDrawer({open, onClose, setShouldUpdate}) {
	//console.log('rerender SettingDrawer');
	const { t, FormattedMessage } = useTranslate('drawer');

	const localJobInfo = useSelector(configSelectors.local.jobInfo),
		world = useSelector(configSelectors.world),
		localWorld = useSelector(configSelectors.local.world),
		server = useSelector(configSelectors.server),
		localServer = useSelector(configSelectors.local.server),
		priceWindow = useSelector(configSelectors.priceWindow),
		localPriceWindow = useSelector(configSelectors.local.priceWindow),

		userDarkMode = useSelector(configSelectors.userDarkMode),
		quality = useSelector(configSelectors.quality),
		considerTime = useSelector(configSelectors.considerTime),
		locale = useSelector(configSelectors.locale),
		sortModel = useSelector(configSelectors.sortModel),

		{setLocalPriceWindow, setLocalWorld, setLocalServer, setLocalJobInfo, setUserDarkMode, setQuality, setConsiderTime, setAllConfig, setGlobalConfig} = configAction,
		dispatch = useDispatch();



	const [importing, setImporting] = useState(null);
	useEffect(() => {
		if(!importing) return;
		importing.then(settings => {
			dispatch(setAllConfig(settings));
			setImporting(null);
		}).catch(() => setImporting(null));
	}, [importing]);

	return (
		<Drawer anchor="left" open={open} onClose={() => {
			dispatch(setGlobalConfig());
			if(world !== localWorld || server !== localServer || priceWindow !== localPriceWindow)
				setShouldUpdate(true);
			onClose();
		}} autoWidth PaperProps={{sx: {padding: '20px'}}}>
			<Typography variant="h5" >
				<FormattedMessage id="appearance" />
			</Typography>
			<FormControl sx={{marginTop: '15px', marginLeft: '15px'}} >
				<FormLabel id="theme-label">{t('theme')}</FormLabel>
				<RadioGroup value={userDarkMode} onChange={({target: {value}}) => dispatch(setUserDarkMode(value))} row aria-labelledby="theme-label" >
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
				<RadioGroup value={quality} onChange={({target: {value}}) => dispatch(setQuality(value))} row aria-labelledby="quality-label" >
					<FormControlLabel control={<Radio color="secondary" size="small" />} label={t('HQ')} value="hq"/>
					<FormControlLabel control={<Radio color="secondary" size="small" />} label={t('NQ')} value="nq"/>
					<FormControlLabel control={<Radio color="secondary" size="small" />} label={t('all')} value="all"/>
				</RadioGroup>
				<StyledFormControlLabel label={t('considerTime')} labelPlacement="top" control={
					<Switch color="secondary" checked={considerTime} onChange={({target: {checked: value}}) => dispatch(setConsiderTime(value))} sx={{marginLeft: '-12px'}}/>
				} sx={{marginLeft: 0}}/>
				<TextField fullWidth label={t('averageWindowSize')} value={localPriceWindow} onChange={({target: {value}}) => {
					const window = Number(value)
					dispatch(setLocalPriceWindow((value.length && (isNaN(window) || window <= 0 || window >= 10)) ? undefined : value));
				}} variant="standard" margin="dense" sx={{width: '160px'}}/>
			</FormControl>

			<Typography variant="h5" mt={3} >
				<FormattedMessage id="retainerInfo" />
			</Typography>
			<FormControl sx={{marginTop: '15px', marginLeft: '15px'}} >
				<Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start'}} >
					{Object.keys(localJobInfo).map((job) => (
						<StyledFormControlLabel key={job} label={t(job)} labelPlacement="top" control={
							<Box key={job} sx={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start'}} >
								{Object.keys(localJobInfo[job]).map((key, i) => (
									<TextField key={key} label={t(key)} value={localJobInfo[job][key] === Number.MAX_SAFE_INTEGER ? '' : localJobInfo[job][key].toString()} onChange={
										({target: {value}}) =>
											NUMERIC.test(value) || value.length === 0 ?
												dispatch(setLocalJobInfo({[job]: {[key]: value.length === 0 ? Number.MAX_SAFE_INTEGER : Number(value)}}))
												: null
									} variant="standard" size="small" sx={{width: '100px', marginRight: i === Object.keys(localJobInfo[job]).length - 1 ? '0px' : '10px'}} />
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
					<TextField select label={t('DC')} value={localWorld} onChange={({target: {value}}) => dispatch(setLocalWorld(value))} variant="standard" margin="dense" sx={{marginRight: "10px"}}>{
						worlds.map((world, i) =>
							(<MenuItem value={world} key={world}>
								{worldsName[i]}
							</MenuItem>)
						)
					}</TextField>
					<TextField select label={t('world')} value={localServer} onChange={({target: {value}}) => dispatch(setLocalServer(value))} variant="standard" margin="dense">{
						servers[worlds.indexOf(localWorld)].map((server, i) =>
							(<MenuItem value={server} key={server}>
								{serversName[worlds.indexOf(localWorld)][i]}
							</MenuItem>)
						)
					}</TextField>
				</Box>
			</FormControl>

			<Box sx={{flex: '1 1 auto'}} />

			<Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
				<Button variant="text" startIcon={<DownloadForOfflineIcon />} onClick={() => {
					let settings = {
						userDarkMode,  quality, considerTime, locale, sortModel,
						world: localWorld, server: localServer, priceWindow: localPriceWindow, jobInfo: localJobInfo
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


export default memo(SettingDrawer)