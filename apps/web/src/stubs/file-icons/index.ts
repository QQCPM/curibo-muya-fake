/**
 * Stub module for @marktext/file-icons
 * The file icon library is not needed for the web version
 */

interface FileIcons {
  matchName: (name: string) => string | null
  matchLanguage: (lang: string) => string | null
  getClassByName: (name: string) => string | null
  getClassByLanguage: (lang: string) => string | null
}

const fileIcons: FileIcons = {
  matchName: function (_name: string): string | null {
    return null
  },
  matchLanguage: function (_lang: string): string | null {
    return null
  },
  getClassByName: function (_name: string): string | null {
    return null
  },
  getClassByLanguage: function (_lang: string): string | null {
    return null
  }
}

export default fileIcons
