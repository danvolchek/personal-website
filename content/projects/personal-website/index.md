---
title: 'Personal Website'
summary: A website to host links, projects, and my blog.
description: A website to host links, projects, and my blog.
date: 2023-11-11
tags: [software]
draft: false
---

## Code

{{< github repo="danvolchek/personal-website" >}}

## Overview

My personal website is the one you're on right now - it holds links, details about projects I've worked on, and a blog for longer form thoughts.

It uses:
* [Hugo](https://gohugo.io) as a template engine
* [Blowfish](https://blowfish.page) as the theme
* [Github pages](https://pages.github.com/) to host the content
* [Google Domains](https://domains.google.com) for the custom domain name

Before this stack, I used a website generator [I wrote myself](https://github.com/danvolchek/personal-website/tree/87d85c92cd4acd9c963902d6832403147ebc2994) that's remarkably similar in idea: take markdown files and generate a static website. I switched to hugo + blowfish because it looks better.

I've added some customizations on top of blowfish:
 * Copying code blocks works regardless of the `highlight.noClasses` setting, allowing for custom code block syntax highlighting.
 * The home page shows recent articles in multiple sections, with configurable settings like taxonomy and display style per section.
 * The color scheme is custom.
