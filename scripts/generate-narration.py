"""Optional authoring tool: pip install edge-tts; not used by the game/build.
Run prepare-narration.mjs first. Review generated pronunciation before approval.
Uses generic Microsoft neural voices, never a named person's voice.
"""
import asyncio, json, os, ssl
from pathlib import Path
import edge_tts
import edge_tts.communicate as communicate
# Retain certificate verification while including managed environment CA trust.
communicate._SSL_CTX.load_verify_locations(ssl.get_default_verify_paths().cafile or '/etc/ssl/certs/ca-certificates.crt')
clips = json.loads(Path('src/lib/narration.json').read_text())
semaphore = asyncio.Semaphore(2)
async def generate(clip, locale, voice):
    async with semaphore:
        path = Path('public/audio') / f"{clip['id']}-{locale}.mp3"
        if path.exists() and path.stat().st_size > 1000:
            return
        text = clip[locale].replace('。', '. ' if locale == 'en' else '。').replace('→', ', ' if locale == 'en' else '，')
        await edge_tts.Communicate(text, voice, rate='-5%', pitch='+3Hz', proxy=os.environ.get('HTTPS_PROXY')).save(str(path))
        print(path.name, flush=True)
async def main():
    await asyncio.gather(*(generate(clip, locale, voice) for clip in clips for locale,voice in [('en','en-US-JennyNeural'),('zh-CN','zh-CN-XiaoxiaoNeural')]))
asyncio.run(main())
