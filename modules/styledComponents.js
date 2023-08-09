import {styled} from "@mui/material/styles";
import {Button, CircularProgress, FormControlLabel, Backdrop, Tooltip} from "@mui/material";
import {tooltipClasses} from "@mui/material/Tooltip";

export const StyledCircularProgress = styled((props) => (<CircularProgress color="secondary" size={30} thickness={3.6} {...props}/>))`
  && {
    margin: 12px;
  }
`;
export const StyledLoadingContainer = styled(Backdrop)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
export const StyledCellContainer = styled('span')`
  display: inline-flex;
  position: relative;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
`
export const StyledGrowingCell = styled('span')`
  flex: 1 0 auto;
`
export const StyledSolidCell = styled('span')`
  flex: 0 0 auto;
`
export const StyledMainContainer = styled(({defaultColor, ...rest}) => (<div {...rest} />))`
  width: calc(100vw - 20px);
  height: calc(100vh - 100px);
  position: relative;

  && .default-server {
    background-color: ${({defaultColor}) => defaultColor};
  }
`
export const StyledGridContainer = styled('div')`
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  position: absolute;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  pointer-events: none;
`;
export const StyledButton = styled(Button)`
  && {
    align-self: flex-start;
    margin: 15px 0;
  }
`;
export const StyledFormControlLabel = styled(FormControlLabel)`
  && {
    align-items: flex-start;
    justify-content: flex-start;
  }
`;
export const StyledIconButton = styled(Button)`
  && {
    min-width: 0;
	margin-right: 4px;
  }
`
export const StyledIcon = styled(({render: Render, fill, ...rest}) => (<Render {...rest} />))`
  height: 1em;
  fill: ${({fill}) => fill};
`

export const StyledTooltip = styled(({ className, children, ...props }) => (
	<Tooltip {...props} classes={{ popper: className }}  children={children}/>
))(({theme}) => ({
	[`& .${tooltipClasses.tooltip}`]: {
		backgroundColor: theme.palette.background.default,
		padding: 0
	},
}));