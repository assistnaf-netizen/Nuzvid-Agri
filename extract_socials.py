import urllib.request
import re

html = urllib.request.urlopen('https://www.nuzvidagrifarms.com').read().decode('utf-8')

socials = set(re.findall(r'href="(https://(?:www\.)?(?:instagram|facebook|twitter|youtube|linkedin)\.com/[^"]+)"', html))
for s in socials:
    print(s)
