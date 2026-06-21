// Employee B (Credit Analyst) is BLOCKED from all AFS tools. forbid overrides permit.
forbid(
  principal is AgentCore::OAuthUser,
  action in [
    AgentCore::Action::"afs___afs_show_summary",
    AgentCore::Action::"afs___afs_show_officer_loans",
    AgentCore::Action::"afs___create_workpackage",
    AgentCore::Action::"afs___jobs_by_officer",
    AgentCore::Action::"afs___loan_summary",
    AgentCore::Action::"afs___payment_history",
    AgentCore::Action::"afs___portfolio_by_officer",
    AgentCore::Action::"afs___reserve_obligation_number",
    AgentCore::Action::"afs___revolver_utilization"
  ],
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-east-1:111204669101:gateway/mcpgateway-eerhmo8ymw"
) when {
  principal.hasTag("cognito:groups") &&
  principal.getTag("cognito:groups") like "*ROLE_ANALYST*"
};
