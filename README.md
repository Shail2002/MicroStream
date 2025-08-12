MicroStream: Trustless Micro‑Subscriptions on XRPL
Inspiration
Recurring payments under $1 are virtually impossible with traditional payment networks. Credit cards levy a $0.30 fee plus a percentage per transaction, and even niche micropayment services still take a sizeable cut
thedefiant.io
. As a result, indie developers and creators are forced into monthly subscriptions or remain dependent on large platforms that hold their user data. With Microstream, we wanted to let creators offer pay‑per‑use or micro‑subscription services directly to their audience without collecting personal information or sacrificing revenue to intermediaries.

What problem does it solve?
Microstream makes it economical to accept recurring micro‑payments for digital content or services. Whether you sell premium articles, access to an API endpoint, or a monthly newsletter that costs only $0.50, Microstream handles the billing for you. Our platform automates recurring transfers between subscribers and creators, records the subscription state, and notifies your application when payments succeed. No bank accounts, credit cards, or PII are ever required.

How does blockchain solve this?
The XRP Ledger (XRPL) excels at micropayments. Transactions finalize in 3–5 seconds and cost fractions of a cent
coincentral.com
. By leveraging XRPL, Microstream eliminates the overhead that makes sub‑dollar payments impossible on traditional rails. Smart logic is implemented using Hooks (a smart‑contract‑like feature) and our own server logic: when a user subscribes, we set up a small on‑ledger instruction that periodically collects payments from the subscriber’s wallet. Because everything executes on XRPL, there is no escrow or custodial risk. The integration with XUMM Wallet allows customers to authorise recurring payments without sharing keys, and PayString addresses provide human‑readable account identifiers.

What unique features of XRPL were utilized?
Hooks – lightweight smart‑contract extensions that run before or after transactions. We use hooks to enforce the recurring payment logic on‑chain (e.g. verifying that a subscription’s payment interval has elapsed). This reduces the need for centralised schedulers and enhances trust.

Multi‑Purpose Tokens (MPTs) – a compact fungible token on XRPL with fixed supply and on‑chain metadata
xrpl.org
. Microstream issues an MPT to represent each subscription tier; ownership of one unit proves an active subscription.

RLUSD Stablecoin – a native USD‑pegged token on XRPL that settles in seconds at negligible cost
coincentral.com
. Using RLUSD shields creators from XRP volatility while preserving the low‑fee model.

PayString & XUMM Wallet – PayString provides human‑friendly addresses, while XUMM Wallet enables one‑click authorisation of recurring payments without handling private keys.

We explicitly do not use Decentralized Identifiers (DIDs) in this project. Authentication is handled via XUMM’s OAuth flow and PayString addresses.
