+++
author = "Enrico Spinielli"
blogger_id = "tag:blogger.com,1999:blog-1947405997418753543.post-6109535931094595422"
blogger_orig_url = "https://ongiantsshoulders.blogspot.com/2009/02/latex-python-and-literate-programming.html"
comments = true
date = "2009-02-24"
modified_time = "2009-07-07T22:13:58.026+02:00"
tags = ["scons", "latex", "python"]
title = "LaTeX, Python and Literate Programming"
url = "/2009/02/24/latex-python-and-literate-programming/"

+++

In my spare time (a couple of hours per weekend...!) I am implementing calcal, a Python version of calendrica-3.0.cl, the Common Lisp implementation of the calendars from [N. Dershowitz](https://www.math.tau.ac.il/%7Enachumd/), [E. M. Reingold](https://emr.cs.iit.edu/%7Ereingold/) *[Calendrical Calculations](https://www.cambridge.org/uk/catalogue/catalogue.asp?isbn=9780521702386), 3rd Edition*. (In case you are interested you can find a preview in [my github repo](https://enrico.spinielli.googlepages.com/).)

At some point I decided to go [Literate Programming](https://en.wikipedia.org/wiki/Literate_programming) using [noweb](https://www.cs.tufts.edu/%7Enr/noweb/). This is an experiment in the experiment but so far it has been a good choice because I can define all I need in the same place and generate documentation, source code (Python, shell scripts ...) from the same source.

I also found something interesting (on a now disappeared blog https://usefreetools.blogspot.com): [executing Python from within LaTex](https://nix-tips.blogspot.com/2008/09/python-inside-latex-and-sage-too.html)! I could use it to avoid to hardcode results in my doc and just calculate them on the fly...

The same blog was showing [how to build LaTeX docs using SCons](https://usefreetools.blogspot.com/2008/07/auto-building-latex-documents-with.html): I will defenitly use it; my Makefile isn't that great nor easy to mantain.