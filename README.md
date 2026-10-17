# Tasker notification saved signal template

Public, sanitized source template. This is not the installed, verified task artifact. Replace CHANNEL_ID_REPLACE_BEFORE_USE in the JavaScript, XML, and mock tests with your own authorized private channel before importing. Revalidate XML/JS consistency and run the mock tests after configuration. No notification body is sent.

The setup task asks the owner directly for a Slack User OAuth token with chat:write and writes it to Tasker private no_backup storage. Never paste tokens into source code, exports, GitHub, or chat. The permission itself is broader than a single channel; the implementation fixes the destination and payload. Existing webhook storage is separate.

The sender posts only DOT_NOTIFY_SAVED_V1 plus an opaque batch. No default destination is usable. Setup performs no network request. Direct sender execution enqueues one signal; retry attempts only existing pending work. Permanent authorization errors block retries until setup is repaired. Timeouts can cause duplicate delivery; receiver-side batch deduplication is required. There is no exactly-once or immediate-delivery guarantee.

Run: node test_user_signal.cjs
The mock suite checks code behavior, not real Android, Slack OAuth, event delivery, or your upload integration. Read UPLOAD-INTEGRATION.ko.md before integrating. Existing upload tasks and profiles are not included or replaced.

Included XML tasks are templates of the helper tasks only. Their task IDs and names may conflict with an existing import; inspect before importing. The original operational files remain separate and unchanged.
