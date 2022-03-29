import {StyledCircularProgress, StyledLoadingContainer} from "./styledComponents";
import strings from './localization';

const ErrorCover = ({retry, error}) => {
	return (
		<StyledLoadingContainer>
			<StyledCircularProgress />
			<span>{strings.formatString(strings.errorMsg, error)}</span>
			{
				retry ?
					<span>{strings.errorRetry}</span>
					: <>{strings.errorRetryFail}</>
			}
		</StyledLoadingContainer>
	);
}


export default ErrorCover;