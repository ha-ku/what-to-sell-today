import styled from "@emotion/styled";
import {Button, CircularProgress, FormControl, FormControlLabel} from "@mui/material";

const StyledCircularProgress = styled(CircularProgress)`
	&& {
		margin: 12px;
	}
`;
const StyledLoadingContainer = styled.div`
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;
const StyledCellContainer = styled.span`
  display: inline-flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
`
const StyledCellSub = styled.span`
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
const StyledFormControl = styled(FormControl)`
  && {
    margin: 15px;
  }
`;
const StyledButton = styled(Button)`
  && {
    align-self: flex-start;
    margin: 15px;
  }
`;
const StyledFormControlLabel = styled(FormControlLabel)`
  && {
    align-items: flex-start;
    justify-content: flex-start;
	margin-bottom: 8px;
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

export {StyledCellSub, StyledIcon, StyledIconButton, StyledCellContainer, StyledLoadingContainer, StyledFormControlLabel, StyledGridContainer, StyledCircularProgress, StyledButton, StyledFormControl};