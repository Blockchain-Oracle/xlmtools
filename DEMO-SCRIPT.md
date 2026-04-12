<p align="center">
  <img src="./assets/xlmtools-header.svg" alt="XLMTools" width="100%"/>
</p>

# XLMTools — Demo Video Script

**Target length**: 2:30 to 3:00 (hackathon spec: 2–3 minutes).
**Format**: Screen recording with voiceover. No cuts during a live demo segment — if something errors, reshoot that segment clean.

---

## Pre-recording checklist

Run through this before you hit record. Each item takes 30 seconds but prevents an embarrassing moment on-camera.

- [ ] **Terminal ready**: iTerm or Terminal, large font (16pt+), dark theme, prompt shortened
- [ ] **Browser ready** with four tabs preloaded:
  1. [xlmtools.com](https://xlmtools.com) (landing page)
  2. [stellar.expert/explorer/testnet](https://stellar.expert/explorer/testnet) (to verify the receipt on-chain)
  3. [xlmtools.com/stats](https://xlmtools.com/stats) (your personal history)
  4. [docs.xlmtools.com](https://docs.xlmtools.com) (optional, for closing shot)
- [ ] **Wallet funded**: either a fresh wallet from `xlm wallet` that friendbot has completed, plus testnet USDC from [faucet.circle.com](https://faucet.circle.com). Verify before recording with `xlm crypto bitcoin` (free call, just to confirm API reachable).
- [ ] **Audio**: quiet room, external mic if possible. Do a 10-second test recording first.
- [ ] **Screen**: close Slack, email, IDE tabs you don't want on camera. Quit apps that might throw notifications.
- [ ] **Cursor position**: start the recording with your cursor somewhere neutral, not hovering over a private file.

---

## Shot-by-shot script

Total target: **2:45**. Natural pacing. Numbers in square brackets are target elapsed time.

### [00:00 – 00:20]  Hook — the problem

**On screen**: Terminal with `claude` running. A blank prompt.

**Say** (slow, measured):
> "AI agents can reason, plan, and act — right up until they need to pay for something. Today every tool service wants the same thing: an account, an API key, a monthly subscription. That friction is the reason agents can't ad-hoc discover and pay for a tool mid-task."

---

### [00:20 – 00:40]  Meet XLMTools

**On screen**: Switch to browser → xlmtools.com landing page. Let the hero animation play briefly. Scroll down about one page height to show the rotating install card.

**Say**:
> "XLMTools is a Stellar-native MCP server. Twenty-one tools. Pay-per-call in USDC. Every payment settles on Stellar testnet in about one second. No API keys. No subscriptions. One line installs it into any MCP host."

---

### [00:40 – 01:05]  The install

**On screen**: Terminal. Type (don't paste — typing looks more authentic on camera, but be quick):

```bash
claude mcp add xlmtools npx @xlmtools/mcp
```

Hit enter. Claude Code confirms the MCP registered. Then run:

```bash
claude mcp list
```

And scroll to the `xlmtools: ... ✓ Connected` line.

**Say** (while typing):
> "That's the whole install. No signup. XLMTools auto-generates a Stellar testnet wallet on first run, funds it with friendbot XLM, and adds a USDC trustline. The only manual step is grabbing testnet USDC from Circle's faucet. Every agent gets its own wallet in about fifteen seconds."

---

### [01:05 – 01:40]  First paid tool call

**On screen**: Still in Claude Code / terminal. Ask the agent:

> "Find me the latest news about Stellar x402 micropayments."

The agent invokes `mcp__xlmtools__search`. Watch the result come back with a list of headlines and — critically — a payment footer line at the bottom that reads something like:

```
Payment: $0.003 USDC · tx/a3f9c28d... · stellar testnet
```

Pause on this for 2-3 seconds so the viewer can read it.

**Say**:
> "I asked for the latest news, and XLMTools called the search tool for three-tenths of a cent USDC. Watch the bottom of the response. That's not a mock. That's a real Stellar transaction hash for a real Soroban USDC transfer that just happened on testnet."

---

### [01:40 – 02:05]  Verify the receipt on-chain

**On screen**: Copy the transaction hash from the terminal. Paste it into the stellar.expert tab (`stellar.expert/explorer/testnet/tx/<hash>`). Stellar Expert loads the transaction page showing the Soroban invocation and the USDC payment operation.

**Say**:
> "Every call creates a real, auditable blockchain transaction. No hidden billing database. No dashboard. Just Stellar. Any user, any agent, any third party can verify any payment, any time."

---

### [02:05 – 02:30]  Per-address history

**On screen**: Back to the terminal. Run:

```bash
xlm wallet
```

Copy the G-address it prints. Paste it into [xlmtools.com/stats](https://xlmtools.com/stats) in the browser. The page loads a live paginated history of every tool call from that wallet — your `search` from 30 seconds ago at the top, with the same tx hash linking back to stellar.expert.

**Say**:
> "And here's your history page. Paste any Stellar wallet address, you see every tool call that wallet has ever made through XLMTools. Free calls get a FREE badge. Paid calls get the tx hash and a link straight to the on-chain receipt. Your agent can audit its own spending in real time."

---

### [02:30 – 02:45]  Close

**On screen**: Either back to the xlmtools.com landing page, or show the `claude mcp add xlmtools npx @xlmtools/mcp` command prominently.

**Say** (closing line, deliberate):
> "XLMTools. First MCP server on Stellar with MPP charge-mode billing. Twenty-one tools. One line to install. On-chain by default. Built for the Stellar Agents hackathon. xlmtools dot com."

**End card** (optional, last 2-3 seconds): the XLMTools logo + the three links: `xlmtools.com`, `docs.xlmtools.com`, `github.com/Blockchain-Oracle/xlmtools`.

---

## Delivery notes

**Tone**: calm, unhurried, confident. This is a demo, not a sales pitch. Let the product do the talking.

**Pacing**: don't rush. 2:45 is plenty of time for everything above. If you feel like you're racing, slow down — judges watch many submissions and they notice when a demo respects their attention.

**Cursor hygiene**: move it deliberately, with purpose. If you need to click something, go there in one motion. Nothing advertises "this is my first take" like a cursor wandering around the screen.

**Silence is fine**: when you're waiting for a response from Claude Code or the API, don't fill the silence with filler words. Three seconds of silence while the tool runs looks intentional. "Uhhh… and… as you can see…" looks unprepared.

**Reshoot over edit**: if you flub a line, reshoot the segment. Don't try to cut around a mistake — the jump cut is more jarring than the stutter would have been.

---

## Recording tools (in order of increasing polish)

1. **macOS built-in** — `Cmd + Shift + 5` → Record Screen. Free. Outputs H.264 MP4. Fine for a hackathon.
2. **Loom** — [loom.com](https://loom.com). Free tier, auto-upload, shareable link. No editing.
3. **OBS Studio** — free, open-source, more control. Learning curve.
4. **ScreenFlow / Camtasia** — paid, best quality + editing. Overkill for 2:45.

---

## Contingencies

- **If a paid tool errors mid-recording** (rare but possible — upstream API flake, rate limit, wallet out of USDC): fall back to a free tool like `xlm crypto bitcoin` or `xlm oracle-price BTC`. The flow is the same minus the payment footer. Mention "the paid tools work the same way — here's the receipt line on one I ran earlier" and pivot to a pre-recorded paid call screenshot if you have one.
- **If friendbot is slow** on the auto-funding step: pre-create the wallet before recording. Delete `~/.xlmtools/config.json` before the first take only if you want to show the first-run flow on camera.
- **If Claude Code doesn't load the MCP tools after `mcp add`**: restart Claude Code. Some hosts only pick up new MCPs on session restart. Mention this on camera if needed — it's expected behavior and reassures viewers you understand the failure mode.

---

## Upload + submission

Once recorded:

1. Upload to YouTube as **Unlisted** (not Private — judges need the link to work). Or use Loom.
2. Copy the video URL.
3. Paste into `SUBMISSION.md` under the `Demo video` row.
4. Also paste into your DoraHacks submission form.
5. Post the same link in your GitHub release notes if you're tagging a release.

Done. Ship it.
