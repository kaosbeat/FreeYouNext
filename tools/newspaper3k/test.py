from newspaper import Article
url = 'http://fox13now.com/2013/12/30/new-year-new-laws-obamacare-pot-guns-and-drones/' 
article = Article(url)


article.download()
article.html

article.parse()
article.authors


print(article.publish_date)
print(article.text)

article.top_image

article.nlp()

print(article.keywords)

print(article.summary)


