import {Badge, Chip, Tooltip} from "@mui/material";
import {memo} from "react";
import useTranslate from "./useTranslate";


function ItemLowest({price, quantity, seller}) {
	const {t} = useTranslate('grid');
	return price ?
		(<Tooltip title={seller} placement="right">
			<Badge color="primary" badgeContent={quantity} max={999} >
				<Chip label={price} size="small" />
			</Badge>
		</Tooltip>) : t('none')
	;
}


export default memo(ItemLowest);