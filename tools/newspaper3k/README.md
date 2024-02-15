# tools built upon newspaper3K
[newspaper3K](https://github.com/codelucas/newspaper)  
[docs](https://newspaper.readthedocs.io/en/latest/)  

# setup
## create pyenv
pyenv virtualenv newspaper3k
pyenv local newspaper3k

## install deps (global system)
sudo apt-get install libxml2-dev libxslt-dev
sudo apt-get install libjpeg-dev zlib1g-dev libpng12-dev

## activate virtualenv (if not autoactivated)
pyenv activate newspaper3k

## install python deps
pip install nltk

## download NLP data
curl https://raw.githubusercontent.com/codelucas/newspaper/master/download_corpora.py | python3

## install newspaper3K
pip3 install newspaper3k

# run tool
look for python files and test around
