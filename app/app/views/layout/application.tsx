import * as React from 'react'

export default (locals, content) => (
    <html>
        <head>
            <title>{locals.title}</title>
        </head>
        <body>
            {content}
        </body>
    </html>
)
