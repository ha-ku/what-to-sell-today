import {StyledButton, StyledFormControl, StyledFormControlLabel} from "./styledComponents";
import {
	Divider,
	Drawer,
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


function SettingDrawer({open, userDarkMode, quality, considerTime, world, server, priceWindow, isLoading, withTime, jobInfo}) {

	const { t, FormattedMessage } = useTranslate('drawer')

	return (<Drawer anchor="left" open={open.value} onClose={open.handler} autoWidth>
		<StyledFormControl>
			<Typography variant="h5" mb={2}>
				<FormattedMessage id="appearance" />
			</Typography>
			<StyledFormControlLabel label={t('theme')} labelPlacement="top" control={
				<RadioGroup value={userDarkMode.value} onChange={userDarkMode.handler} row>
					<FormControlLabel control={<Radio color="secondary" size="small" />} label={t('day')} value="light"/>
					<FormControlLabel control={<Radio color="secondary" size="small" />} label={t('night')} value="dark"/>
					<FormControlLabel control={<Radio color="secondary" size="small" />} label={t('auto')} value="auto"/>
				</RadioGroup>
			} sx={{marginLeft: 0}}/>
		</StyledFormControl>
		<Divider />
		<StyledFormControl>
			<Typography variant="h5" mb={2}>
				<FormattedMessage id="autoUpdated" />
			</Typography>
			<StyledFormControlLabel label={t('quality')} labelPlacement="top" control={
				<RadioGroup value={quality.value} onChange={quality.handler} row>
					<FormControlLabel control={<Radio color="secondary" size="small" />} label={t('HQ')} value="hq"/>
					<FormControlLabel control={<Radio color="secondary" size="small" />} label={t('NQ')} value="nq"/>
					<FormControlLabel control={<Radio color="secondary" size="small" />} label={t('all')} value="all"/>
				</RadioGroup>
			} sx={{marginLeft: 0}}/>
			{
				withTime ?
					<StyledFormControlLabel label={t('considerTime')} labelPlacement="top" control={
						<Switch color="secondary" checked={considerTime.value} onChange={considerTime.handler} sx={{marginLeft: '-12px'}}/>
					} sx={{marginLeft: 0}}/>
					: null
			}
			<Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start'}} >
				{Object.keys(jobInfo.value).map((job) => (
					<StyledFormControlLabel label={t(job)} labelPlacement="top" control={
						<Box key={job} sx={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start'}} >
							{Object.keys(jobInfo.value[job]).map((key, i) => (
								<TextField key={key} label={t(key)} value={jobInfo.value[job][key]} onChange={
									(e) => jobInfo.handler(e, job, key)
								} variant="outlined" size="small" sx={{width: '90px', marginRight: i === Object.keys(jobInfo.value[job]).length - 1 ? '0px' : '10px'}} />
							))}
						</Box>
					} sx={{marginX: 0}}/>
				))}
			</Box>
		</StyledFormControl>
		<Divider />
		<StyledFormControl>
			<Typography variant="h5" mb={2}>
				<FormattedMessage id="manualUpdated" />
			</Typography>
			<Box sx={{display: "flex", flexDirection: "row", justifyContent: "flex-start"}}>
				<TextField select value={world.value} onChange={world.handler} variant="outlined" label={t('DC')} margin="dense" sx={{marginRight: "10px"}}>{
					worlds.map((world, i) =>
						(<MenuItem value={world} key={world}>
							{worldsName[i]}
						</MenuItem>)
					)
				}</TextField>
				<TextField select value={server.value} onChange={server.handler} variant="outlined" label={t('world')} margin="dense">{
					servers[worlds.indexOf(world.value)].map((server, i) =>
						(<MenuItem value={server} key={server}>
							{serversName[worlds.indexOf(world.value)][i]}
						</MenuItem>)
					)
				}</TextField>
			</Box>
			<TextField fullWidth label={t('averageWindowSize')} value={priceWindow.value} onChange={priceWindow.handler} variant="outlined" margin="dense"/>
		</StyledFormControl>
		<Divider />
		<StyledButton variant="contained" color="primary" size="large" disabled={isLoading.value} onClick={isLoading.handler}>
			<FormattedMessage id="update" />
		</StyledButton>
	</Drawer>);
}


export default SettingDrawer