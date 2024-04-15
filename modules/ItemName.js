import {
	Avatar,
	Badge,
	Box,
	Button,
	Card,
	Divider,
	Link,
	List,
	ListItem, ListItemAvatar,
	ListItemText
} from "@mui/material";
import {badgeClasses} from "@mui/material/Badge";
import {StyledIcon, StyledIconButton, StyledTooltip} from "./styledComponents";
import {
	InfoOutlined as InfoOutlinedIcon,
	LibraryBooksOutlined as LibraryBooksOutlinedIcon,
	LinkOutlined as LinkOutlinedIcon,
	TravelExplore as TravelExploreIcon,
	UpdateOutlined as UpdateOutlinedIcon
} from "@mui/icons-material";
import HuijiIcon from '../public/img/huijiwiki.svg';
import UniIcon from '../public/img/universalis.svg';
import useTranslate from "./useTranslate";
import {memo} from "react";

const dateFormat = new Intl.DateTimeFormat('zh-CN', {month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", hour12: false});

function ItemName({id, value, enName, level, defaultLastUploadTime, lastUploadTime, withTime, onClick}) {

	const {t} = useTranslate('grid')
	const {PI, sin, cos, min} = Math;
	const outdatedRatio = min((new Date().getTime() - defaultLastUploadTime) / 43200000, 1);
	const r = 40;

	return (<Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
		<Box sx={{flexGrow: 0, display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}} >
			<Avatar variant="rounded" src={`https://universalis-ffxiv.github.io/universalis-assets/icon2x/${id}.png`} sx={{width: 32, height: 32, marginRight: 1}} alt={enName}></Avatar>
			<Button variant="text" sx={{textTransform: 'initial', minWidth: 0}} onClick={onClick} >
				<Box component="span" sx={{maxWidth: '116px', overflow: "hidden", textOverflow: "ellipsis"}}>
					{t("itemName", {
						name: value,
						enName: enName
					})}
				</Box>
			</Button>
		</Box>
		<Box sx={{ flexGrow: 1 }} />
		<StyledTooltip title={<Card>
			<List>
				{withTime ?
					<ListItem>
						<ListItemAvatar>
							<Avatar>
								<LibraryBooksOutlinedIcon />
							</Avatar>
						</ListItemAvatar>
						<ListItemText primary={t("level", {level})} />
					</ListItem>
					: null
				}
				<ListItem>
					<ListItemAvatar>
						<Avatar>
							<LinkOutlinedIcon />
						</Avatar>
					</ListItemAvatar>
					<StyledIconButton size="small">
						<Link target="_blank" href={`https://universalis.app/market/${id}`} rel="noopener noreferrer">
							<StyledIcon render={UniIcon} fill='#86a2ff' viewBox="0 0 145.9 68.5"/>
						</Link>
					</StyledIconButton>
					<StyledIconButton size="small">
						<Link target="_blank" href={`https://ff14.huijiwiki.com/wiki/物品:${value}`} rel="noopener noreferrer">
							<StyledIcon render={HuijiIcon} fill='#aaaaaa' viewBox="0 0 135.55 61.26"/>
						</Link>
					</StyledIconButton>
				</ListItem>
				<Divider />
				<ListItem>
					<ListItemAvatar>
						<Avatar>
							<UpdateOutlinedIcon />
						</Avatar>
					</ListItemAvatar>
					<ListItemText primary={t("updateLocalAt")} secondary={dateFormat.format(defaultLastUploadTime)} />
				</ListItem>
				<ListItem>
					<ListItemAvatar>
						<Avatar>
							<TravelExploreIcon />
						</Avatar>
					</ListItemAvatar>
					<ListItemText primary={t("updateGlobalAt")} secondary={dateFormat.format(lastUploadTime)} />
				</ListItem>
			</List>
		</Card>} placement="right">
			<Badge color="warning" badgeContent=" " sx={{
				[`& .${badgeClasses.badge}`]: {
					mask: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M 50 50 v -${r} A ${r} ${r} 0 ${outdatedRatio > 0.5 ? 0 : 1} 1 ${
						Number(50 - sin(outdatedRatio * 2 * PI) * r).toFixed(2)
					} ${
						Number(50 - cos(outdatedRatio * 2 * PI) * r).toFixed(2)
					} L 50 50 M 50 0 A 50 50 0 1 0 50 100 A 50 50 0 1 0 50 0 Z" fill-rule="evenodd" stroke="none"></path></svg>' ) center/contain no-repeat`,
				}
			}}>
				<InfoOutlinedIcon />
			</Badge>
		</StyledTooltip>
	</Box>)
}


export default memo(ItemName)