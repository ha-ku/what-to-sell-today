import {Close as CloseIcon} from "@mui/icons-material";
import useTranslate from "./useTranslate";
import {IconButton, Snackbar} from "@mui/material";

export default function CopyHint({open, setOpen}) {
	const { t } = useTranslate('grid')
	return (
		<Snackbar open={open} autoHideDuration={1000} onClose={() => setOpen(false)} message={t('copyHint')} action={
			<IconButton size="small" onClick={() => setOpen(false)} >
				<CloseIcon fontSize="small"/>
			</IconButton>
		} />
	);
}
