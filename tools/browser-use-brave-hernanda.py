import asyncio
import sys
from contextlib import asynccontextmanager

from browser_use.browser.profile import BrowserProfile
from browser_use.browser.session import BrowserSession
from browser_use.skill_cli import direct

BRAVE_EXECUTABLE = r"C:\Users\LENOVO\AppData\Local\BraveSoftware\Brave-Browser\Application\brave.exe"
BRAVE_USER_DATA_DIR = r"C:\Users\LENOVO\AppData\Local\BraveSoftware\Brave-Browser\User Data"
BRAVE_PROFILE_DIRECTORY = "hernanda"


@asynccontextmanager
async def brave_browser(use_remote: bool = False):
    if use_remote:
        async with direct.browser(use_remote=True) as session:
            yield session
        return

    state = direct._load_state()
    cdp_url = state.get('cdp_url')
    session = None

    if cdp_url:
        session = BrowserSession(cdp_url=cdp_url)
        try:
            await session.start()
            await direct._activate_content_target(session, state.get('target_id'))
        except Exception:
            direct._clear_state()
            session = None

    if session is None:
        profile = BrowserProfile(
            headless=False,
            executable_path=BRAVE_EXECUTABLE,
            user_data_dir=BRAVE_USER_DATA_DIR,
            profile_directory=BRAVE_PROFILE_DIRECTORY,
        )
        session = BrowserSession(browser_profile=profile)
        await session.start()
        assert session.cdp_url is not None
        direct._save_state({'cdp_url': session.cdp_url, 'remote': False})

    try:
        yield session
    finally:
        if session.agent_focus_target_id:
            current_state = direct._load_state()
            current_state['target_id'] = session.agent_focus_target_id
            direct._save_state(current_state)
        if session._cdp_client_root:
            try:
                await session._cdp_client_root.stop()
            except Exception:
                pass
        await session.event_bus.stop(clear=True, timeout=2)


direct.browser = brave_browser

if __name__ == '__main__':
    sys.exit(asyncio.run(direct.main()))