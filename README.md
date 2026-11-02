# Portfolio resume download

Upload these files to the ROOT of your public `metallurgist.github.io` repository.

The PDF in `assets/cv/` is your exact original uploaded file, byte-for-byte unchanged. No modified CV is included.

## To update your CV
1. Delete the existing PDF from `assets/cv/` in GitHub.
2. Upload exactly ONE replacement PDF to `assets/cv/`, with any filename (including a date).
3. Commit the change and wait for GitHub Pages to deploy.
4. Click Download Resume on the website to test it.

The Download Resume buttons query the public GitHub repository to discover the single PDF filename, then request that original PDF directly from GitHub Pages with the browser download attribute. It does not rename, edit, or convert the PDF. If GitHub's API is unavailable or rate-limited, the button shows an error rather than downloading the wrong file.

Important: GitHub commit history can retain older PDFs even after you delete them. Do not upload a CV with information you do not want public.


## Profile photo
The homepage loads `assets/profile.jpg`. To update the photo, replace that file while keeping its filename.
The original resume in `assets/cv/` is preserved without modification.
