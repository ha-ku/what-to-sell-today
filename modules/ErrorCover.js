import {StyledCircularProgress, StyledLoadingContainer} from "./styledComponents";

const ErrorCover = ({retry, error}) => {
	return (
		<StyledLoadingContainer>
			<StyledCircularProgress color="secondary" />
			<span>出错了，错误代码：{error.code}</span>
			{
				retry ?
					<span>正在重试...</span>
					: <>
						<span>请稍后再试，或联系管理员</span>
						<span>如果你是管理员那你反省一下</span>
					</>
			}
		</StyledLoadingContainer>
	);
}


export default ErrorCover;