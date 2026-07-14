# pushing
echo "# final" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/erich0521/uniqueue.git
git push -u origin main



# FINAL BRANCHING
git clone https://.....
cd foldername
git switch -c feature/.... (bagong branch)
git switch feature/.... (may existing branch)
git status
git add .
git commit -m "Your commit message"
git push -u origin feature/...



# branch
git checkout -b your-branch-name
git branch
git add .
git commit -m "Your commit message"
git push -u origin your-branch-name

# BRANCH
Siguraduhing updated ang main (nagawa mo na):
    git switch main
    git pull origin main
Gumawa ng bagong branch:
    git switch -c feature/modified-login-css
Kung sasabihin ni Git na branch already exists, gamitin mo:
    git switch feature/modified-login-css
    git status
Commit at push:
    git add .
    git commit -m "Update login page styling"
    git push -u origin feature/modified-login-css
Pagkatapos, pumunta sa GitHub at gumawa ng Pull Request mula:
    base: main
    compare: feature/modified-login-css

# pulling
git switch main
git pull origin main


# PULLING

    git status
    git branch -a
Kung may main at origin/main, diretso sa step 2.
    git switch main
    git pull origin main


# option
Kung wala ka pang tamang clone

Mula sa parent folder (halimbawa C:\Users\Nicole\Desktop\Capstone_uniqueue_web):

    git clone https://github.com/Rheyven007/uniqueue-web.git
    cd uniqueue-web
    git switch main
    git pull origin main
