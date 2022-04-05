import {styled} from "@mui/material/styles";
import {Button, CircularProgress, FormControlLabel} from "@mui/material";

const StyledCircularProgress = styled((props) => (<CircularProgress color="secondary" size={30} thickness={3.6} {...props}/>))`
	&& {
		margin: 12px;
	}
`;
const StyledLoadingContainer = styled('div')`
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;
const StyledCellContainer = styled('span')`
  display: inline-flex;
  position: relative;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
`
const StyledCellSub = styled('span')`
  flex: 1;
`
const StyledGridContainer = styled(({defaultColor, ...rest}) => (<div {...rest} />))`
  width: calc(100vw - 20px);
  height: calc(100vh - 100px);
  margin: 20px 10px 10px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  && .default-server {
    background-color: ${({defaultColor}) => defaultColor};
  }
`;
const StyledButton = styled(Button)`
  && {
    align-self: flex-start;
    margin: 15px 0;
  }
`;
const StyledFormControlLabel = styled(FormControlLabel)`
  && {
    align-items: flex-start;
    justify-content: flex-start;
  }
`;
const StyledIconButton = styled(Button)`
  && {
    min-width: 0;
  }
`
const StyledIcon = styled(({render: Render, fill, ...rest}) => (<Render {...rest} />))`
  height: 1em;
  fill: ${({fill}) => fill};
`

export {StyledCellSub, StyledIcon, StyledIconButton, StyledCellContainer, StyledLoadingContainer, StyledFormControlLabel, StyledGridContainer, StyledCircularProgress, StyledButton};