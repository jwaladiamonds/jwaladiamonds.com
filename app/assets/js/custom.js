let posts
alert("hello")
document.body.onload = async (e) => {
    console.log("document loaded!")
    posts = await fetch("https://www.techiediaries.com/api/feed.json").then(function (response) {
        return response.json()
    })
    posts.forEach(element => {
        let child = document.createElement('div')
        child.classList.add('mt-1');
        ['card'].forEach((v) => {
            child.classList.add(v)
        })
        child.innerHTML = `
                <hr>
                <div class="card-body">
                    <h2 class="card-title">${element.title}</h2>
                    <p class="card-text">${element.excerpt}</p>
                    <div class="card-footer">
                        <a href="${element.url}" class="card-link">Read</a>
                        <a href="#" class="card-link">Save to read offline</a>
                    </div>

                </div>`
        document.getElementById("postsDiv").appendChild(child)
    })
}
