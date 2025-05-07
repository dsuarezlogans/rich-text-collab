import { Extension } from '@tiptap/core'
import { ySyncPlugin, yCursorPlugin, yUndoPlugin } from 'y-prosemirror'

export const CollabExtension = (yXmlFragment, awareness) => Extension.create({
  name: 'collaboration',

  addProseMirrorPlugins() {
    return [
      ySyncPlugin(yXmlFragment),
      yCursorPlugin(awareness),
      yUndoPlugin()
    ]
  }
})