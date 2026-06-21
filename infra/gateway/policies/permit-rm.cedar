// Employee A (Relationship Manager): cognito:groups contains ROLE_RM -> any tool on the gateway.
permit(
  principal is AgentCore::OAuthUser,
  action,
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-east-1:111204669101:gateway/mcpgateway-eerhmo8ymw"
) when {
  principal.hasTag("cognito:groups") &&
  principal.getTag("cognito:groups") like "*ROLE_RM*"
};
