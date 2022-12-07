import {StyledCircularProgress, StyledLoadingContainer} from "./styledComponents";
import useTranslate from "./useTranslate";

const ErrorCover = ({open, retry, error}) => {

	const { FormattedMessage } = useTranslate('error');

	return (
		<StyledLoadingContainer open={open} sx={{zIndex: theme => theme.zIndex.drawer + 1, backgroundColor: theme => theme.palette.background.paper}}>
			<StyledCircularProgress />
			<span>
				<FormattedMessage id="msg" values={{code: error?.code}} />
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