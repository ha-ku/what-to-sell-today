import {StyledFormControlLabel} from "./styledComponents";
import {
	Drawer,
	FormLabel,
	FormControl,
	FormControlLabel,
	MenuItem,
	Radio,
	RadioGroup,
	Switch,
	TextField,
	Typography,
	Box
} from "@mui/material";
import {servers, serversName, worlds, worldsName} from "./worldsAndServers";
import useTranslate from "./useTranslate";
import useHandler from "./useHandler";
import {useState} from "react";
const SERVER = worlds.reduce((a, w, i) => {
		a[w] = servers[i][0];
		return a;
	}, {});

const NUMERIC = new RegExp(/^[0-9]*$/);

function SettingDrawer({open, userDarkMode, quality, considerTime, world: extWorld, server: extServer, priceWindow: extPriceWindow, isLoading, jobInfo: extJobInfo}) {

	const [jobInfo, handleJobInfo] = useHandler(extJobInfo.value, ({target: {value}}, job, key) =>
		NUMERIC.test(value) ? (jobInfo) => ({ ...jobInfo, [job]: {...(jobInfo[job]), [key]: value} }) : undefined
	);

	const { t, FormattedMessage } = useTranslate('drawer');

	const [world, setWorld] = useState(extWorld.value),
		[server, setServer] = useState(extServer.value),
		[priceWindow, handlePriceWindow] = useHandler(extPriceWindow.value, ({target: {value}}) => {
			const window = Number(value)
			return (value.length && (isNaN(window) || window <= 0 || window >= 10)) ? undefined : value;
		});
	const handleWorld = ({target: {value}}) => {
		setWorld(value);
		setServer(SERVER[value]);
	};
	const handleServer = ({target: {value}}) => setServer(value);

	return (<Drawer anchor="left" open={open.value} onClose={() => {
		extJobInfo.handler(jobInfo);
		open.handler();
		if(!(extWorld.value === world && extServer.value === server && extPriceWindow.value === priceWindow)) {
			if(extWorld.value !== world) extWorld.handler(world);
			if(extServer.value !== server) extServer.handler(server);
			if(extPriceWindow.value !== priceWindow) extPriceWindow.handler(priceWindow);
			isLoading.handler();
		}
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
			<TextField fullWidth label={t('averageWindowSize')} value={priceWindow} onChange={handlePriceWindow} variant="standard" margin="dense" sx={{width: '160px'}}/>
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
									(e) => handleJobInfo(e, job, key)
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
	</Drawer>);
}


export default SettingDrawer