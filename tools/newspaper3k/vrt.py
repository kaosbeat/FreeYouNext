import newspaper

# config = newspaper.Config()
# config.memoize_articles = False

vrt = newspaper.build('https://www.vrt.be/vrtnws/nl/',  memoize_articles=False, language='nl')


print(vrt.size())

for article in vrt.articles:

    print(article.url)
    article.download()
    article.parse()
    print(article.text)


# for category in bruzz.category_urls():
#     print(category)

