// Employee B (Credit Analyst): cognito:groups contains ROLE_ANALYST -> tools on the gateway.
// (AFS tools are then removed by forbid-analyst-afs.cedar, which overrides this permit.)
permit(
  principal is AgentCore::OAuthUser,
  action,
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-east-1:111204669101:gateway/mcpgateway-eerhmo8ymw"
) when {
  principal.hasTag("cognito:groups") &&
  principal.getTag("cognito:groups") like "*ROLE_ANALYST*"
};
