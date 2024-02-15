import newspaper

# config = newspaper.Config()
# config.memoize_articles = False

bruzz = newspaper.build('https://www.bruzz.be/nieuws',  memoize_articles=False, language='nl')


print(bruzz.size())

for article in bruzz.articles:

    print(article.url)
    article.download()
    article.parse()
    print(article.text)


# for category in bruzz.category_urls():
#     print(category)

