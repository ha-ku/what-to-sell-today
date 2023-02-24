import {styled} from "@mui/material/styles";
import {Button, CircularProgress, FormControlLabel, Backdrop} from "@mui/material";

const StyledCircularProgress = styled((props) => (<CircularProgress color="secondary" size={30} thickness={3.6} {...props}/>))`
  && {
    margin: 12px;
  }
`;
const StyledLoadingContainer = styled(Backdrop)`
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
const StyledMainContainer = styled('div')`
  width: calc(100vw - 20px);
  height: calc(100vh - 100px);
  position: relative;
`
const StyledGridContainer = styled(({defaultColor, ...rest}) => (<div {...rest} />))`
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

export {StyledCellSub, StyledIcon, StyledIconButton, StyledCellContainer, StyledLoadingContainer, StyledFormControlLabel, StyledMainContainer, StyledGridContainer, StyledCircularProgress, StyledButton};