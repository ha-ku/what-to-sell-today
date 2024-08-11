import {Chip} from "@mui/material";
import {
	NorthEastOutlined as NorthEastOutlinedIcon,
	SouthEastOutlined as SouthEastOutlinedIcon
} from "@mui/icons-material";
import {memo} from "react";
import {StyledCellContainer, StyledGrowingCell, StyledSolidCell} from "./styledComponents";


function ItemMeanLow({value, hist, lowest, valueFormatter}) {
	return (<>
		<StyledCellContainer>
			<StyledGrowingCell>
				{valueFormatter(hist)}
			</StyledGrowingCell>
			<StyledSolidCell>
				<Chip icon={!hist || (hist > (value > 0 ? value : Number.MAX_SAFE_INTEGER)) ?
					(<SouthEastOutlinedIcon color="warning" fontSize="small" />) :
					(hist < (lowest ?? Number.MAX_SAFE_INTEGER) ?
							(<NorthEastOutlinedIcon color="success" fontSize="small" />)
							: null
					)
				} label={valueFormatter(value)} variant="outlined"
					  color={!hist || (hist > (value > 0 ? value : Number.MAX_SAFE_INTEGER)) ? "warning" :
						  (hist < (lowest ?? Number.MAX_SAFE_INTEGER) ? "success"
								  : "default"
						  )
					  }
				/>
			</StyledSolidCell>
		</StyledCellContainer>
	</>);
}



export default memo(ItemMeanLow);