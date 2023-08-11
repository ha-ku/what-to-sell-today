import {Box} from "@mui/material";
import LineChart from "./LineChart";
import {StyledCellContainer, StyledGrowingCell} from "./styledComponents";
import {memo} from "react";


function ItemVolumns({value, height, width, color, darkMode}) {
	return (<>
		<Box sx={{
			position: 'relative',
			alignSelf: 'flex-start'
		}}>
			<Box sx={{
				position: 'absolute',
				left: -10,
				top: 0
			}}>
				<LineChart {...{ height, width, color, darkMode}} data={[0,...value].map((v, i) => [i, v])}/>
			</Box>
		</Box>
		<StyledCellContainer>
			{[1, 3, 7].map(vI =>
				(<StyledGrowingCell key={vI}>
					{value[vI-1]}
				</StyledGrowingCell>)
			)}
		</StyledCellContainer>
	</>);
}


export default memo(ItemVolumns)