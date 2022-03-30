import {StyledCircularProgress, StyledLoadingContainer} from "./styledComponents";
import useTranslate from "./useTranslate";

const ErrorCover = ({retry, error}) => {

	const { FormattedMessage } = useTranslate('error');

	return (
		<StyledLoadingContainer>
			<StyledCircularProgress />
			<span>
				<FormattedMessage id="msg" values={error} />
			</span>
			<span>
			{retry ?
				<FormattedMessage id="retry" />
				: <FormattedMessage id="retryFail" />
			}
					</span>
		</StyledLoadingContainer>
	);
}


export default ErrorCover;