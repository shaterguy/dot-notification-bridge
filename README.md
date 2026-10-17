# Tasker saved-signal template v0.1.0-dev6

Sanitized source template, not the configured installed artifact. Replace CHANNEL_ID_REPLACE_BEFORE_USE in JS, XML and tests with your own authorized destination before import. Never commit tokens or notification contents. Setup/private storage is unchanged from dev5; this package does not request token entry.

The signal helper reads either Tasker scalar par1 or array par[0]. Conflicting nonempty modes and malformed arrays fail closed without changing pending work. Explicit retry with no pending work sends nothing; retry with pending work preserves its batch. Empty manual-play input still enqueues one test signal. This corrects a reproducible array-only input case; no claim is made that this is the confirmed cause on every device.

The helper task is named dot 사용자 알림 신호 v0.1.0-dev6. Import as a distinct task, then select that name in the two existing Perform Task calls. Keep Parameter 1 retry in the first call and enqueue after confirmed successful upload, and keep existing priority/error settings. Do not change the existing profile or import a whole Tasker backup. Do not assume a same-name import safely replaces tasks.

Mock checks: node test_user_signal_dev6.cjs; node test_mode_mapping.cjs
These tests are not Android or real Slack delivery tests. Notification content is never sent; payload is only a fixed prefix plus opaque batch. Token scope is broader than a channel, but the implementation fixes destination and API. No exactly-once/immediate-delivery guarantee.
