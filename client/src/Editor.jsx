import React, { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import * as Y from 'yjs'
import * as awarenessProtocol from 'y-protocols/awareness.js'
import { io } from 'socket.io-client'

import { CollabExtension } from './CollabExtension'

const docName = 'demo'

export default function CollaborativeEditor() {
    // 1. Create Yjs Doc and fragment
    const ydoc = new Y.Doc()
    const yXmlFragment = ydoc.getXmlFragment('prosemirror')
    const awareness = new awarenessProtocol.Awareness(ydoc)

    // 2. Setup Socket.IO connection and sync
    useEffect(() => {
        console.log('Connecting to WebSocket server...')
        const socket = io('ws://localhost:3000', {
            query: { docName }
        })

        socket.on('sync', (update) => {
            if (update instanceof ArrayBuffer) {
                update = new Uint8Array(update)
            }

            if (update instanceof Uint8Array) {
                Y.applyUpdate(ydoc, update)
            } else {
                console.error('Invalid update type', update)
            }
        })

        ydoc.on('update', (update) => {
            console.log('Sending update:', update)
            socket.emit('sync', update)
        })

        return () => {
            socket.disconnect()
        }
    }, [])

    // 3. Create the Tiptap editor with Yjs plugins
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ history: false }), // disable built-in history
            CollabExtension(yXmlFragment, awareness),
        ],
        editorProps: {
            attributes: { class: 'prose max-w-full border p-4' },
            handleDOMEvents: {},
        }
    })

    if (!editor) return <p>Loading editor...</p>

    return (
        <div>
            <EditorContent editor={editor} />
        </div>
    )
}