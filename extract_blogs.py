import urllib.request
from html.parser import HTMLParser

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = []
        self.ignore = False
        self.ignore_tags = {'script', 'style', 'head', 'meta', 'link'}

    def handle_starttag(self, tag, attrs):
        if tag in self.ignore_tags:
            self.ignore = True

    def handle_endtag(self, tag):
        if tag in self.ignore_tags:
            self.ignore = False

    def handle_data(self, data):
        if not self.ignore and data.strip():
            self.text.append(data.strip())

html = urllib.request.urlopen('https://www.nuzvidagrifarms.com/blogs/news').read().decode('utf-8')
parser = TextExtractor()
parser.feed(html)

with open('blog_extract.txt', 'w', encoding='utf-8') as f:
    for t in parser.text:
        f.write(t + "\n")
