// Employee B (Credit Analyst) may READ AFS, but is BLOCKED from AFS WRITE/mutating tools.
// forbid overrides permit, so permit-analyst grants the reads and this removes the writes.
// (RM has no such forbid -> RM retains write access, gated by the app's approval prompts.)
//
// NOTE: Cedar can't pattern-match action ids, so writes are enumerated. When a NEW AFS write tool
// is added, add it here (the semantic layer also tags read/write as defense-in-depth, but Cedar is
// the authoritative gate — keep this list current).
forbid(
  principal is AgentCore::OAuthUser,
  action in [
    AgentCore::Action::"afs___create_customer",
    AgentCore::Action::"afs___create_obligor",
    AgentCore::Action::"afs___create_workpackage",
    AgentCore::Action::"afs___post_financial_transaction",
    AgentCore::Action::"afs___advance_workpackage_stage",
    AgentCore::Action::"afs___update_workpackage_status",
    AgentCore::Action::"afs___reserve_obligation_number"
  ],
  resource == AgentCore::Gateway::"arn:aws:bedrock-agentcore:us-east-1:111204669101:gateway/mcpgateway-eerhmo8ymw"
) when {
  principal.hasTag("cognito:groups") &&
  principal.getTag("cognito:groups") like "*ROLE_ANALYST*"
};
