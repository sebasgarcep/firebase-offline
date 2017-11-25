import base64 from 'base-64'

export default function createWebTools (admin) {
  const getRefFromQueryParams = (path, params) => {
    let ref = admin.database().ref(path)

    if (!params) return ref

    if (params.orderByKey) {
      ref = ref.orderByKey()
    }

    if (params.orderByValue) {
      ref = ref.orderByValue()
    }

    if (params.orderByChild) {
      ref = ref.orderByChild(params.orderByChild)
    }

    if (params.startAt) {
      ref = ref.startAt(params.startAt)
    }

    if (params.equalTo) {
      ref = ref.equalTo(params.equalTo)
    }

    if (params.endAt) {
      ref = ref.endAt(params.endAt)
    }

    if (params.limitToFirst) {
      ref = ref.limitToFirst(params.limitToFirst)
    }

    if (params.limitToLast) {
      ref = ref.limitToLast(params.limitToLast)
    }

    return ref
  }

  const fetchCollection = async (path, params, callback) => {
    const ref = getRefFromQueryParams(path, params)

    try {
      const snapshot = await ref.once('value')
      const items = []
      snapshot.forEach((child) => {
        items.push({ key: child.key, value: child.val() })
      })
      if (callback) callback(null, items)
    } catch (error) {
      if (callback) callback(error)
    }
  }

  const fetchItem = async (path, params, callback) => {
    const ref = getRefFromQueryParams(path, params)

    try {
      const snapshot = await ref.once('value')
      const value = snapshot.val()
      if (callback) callback(null, value)
    } catch (error) {
      if (callback) callback(error)
    }
  }

  const subscribe = (path, eventType, params, callback) => {
    const ref = getRefFromQueryParams(path, params)

    const successCallback = (snapshot) => {
      if (callback) callback(null, { key: snapshot.key, value: snapshot.val() })
    }

    const errorCallback = error => callback && callback(error)

    ref.on(eventType, successCallback, errorCallback)
  }

  const commit = async (updates, callback) => {
    try {
      await admin.database().ref().update(updates)
      if (callback) callback(null)
    } catch (error) {
      if (callback) callback(error)
    }
  }

  const detectNetworkChanges = (statusCallback) => {
    const connectedRef = admin.database().ref('.info/connected')
    connectedRef.on('value', (snapshot) => {
      const status = snapshot.val() === true
      if (statusCallback) statusCallback({ online: status })
    })
  }

  const atob = base64.decode

  const base64ToBinary = (encodedFile) => {
    const raw = atob(encodedFile)
    const array = new Uint8Array(new ArrayBuffer(raw.length))

    for (let i = 0; i < raw.length; i += 1) {
      array[i] = raw.charCodeAt(i)
    }

    return array
  }

  const dataUpload = async (path, data, callback) => {
    try {
      const storageRef = admin.storage().ref(path)
      const bytes = base64ToBinary(data)
      const { downloadURL } = await storageRef.put(bytes)
      if (callback) callback(null, downloadURL)
    } catch (error) {
      if (callback) callback(error)
    }
  }

  const createUserWithEmailAndPassword =
    async (email, password, callback) => {
      try {
        const userRecord = await admin.auth().createUserWithEmailAndPassword(email, password)
        if (callback) callback(null, userRecord)
      } catch (error) {
        if (callback) callback(error)
      }
    }

  const signInWithEmailAndPassword =
    async (email, password, callback) => {
      try {
        const userRecord = await admin.auth().signInWithEmailAndPassword(email, password)
        if (callback) callback(null, userRecord)
      } catch (error) {
        if (callback) callback(error)
      }
    }

  const logout = async (callback) => {
    try {
      await admin.auth().signOut()
      if (callback) callback(null)
    } catch (error) {
      if (callback) callback(error)
    }
  }

  const updatePassword = async (password, callback) => {
    try {
      await admin.auth().currentUser.updatePassword(password)
      if (callback) callback(null)
    } catch (error) {
      if (callback) callback(error)
    }
  }

  const sendPasswordResetEmail = async (email, callback) => {
    try {
      await admin.auth().sendPasswordResetEmail(email)
      if (callback) callback(null)
    } catch (error) {
      if (callback) callback(error)
    }
  }

  return {
    fetchCollection,
    fetchItem,
    subscribe,
    commit,
    dataUpload,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    logout,
    detectNetworkChanges,
    updatePassword,
    sendPasswordResetEmail
  }
}
