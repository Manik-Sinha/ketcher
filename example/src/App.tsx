import 'ketcher-react/dist/index.css'

import { ButtonsConfig, Editor } from 'ketcher-react'

import {
  Ketcher,
  RemoteStructServiceProvider,
  StructServiceProvider
} from 'ketcher-core'

import { ErrorModal } from './ErrorModal'
import { PolymerToggler } from './PolymerToggler'
import {useEffect, useState} from 'react'

export const fetchWasm = async (
    path: string,
    abortSignal: AbortSignal
): Promise<Response> => {
  const response = await globalThis.fetch(path, { signal: abortSignal });
  if (!response.ok) {
    throw new Error(`Failed to fetch resource ${path}.`);
  }
  console.log("ok")
  return response;
};

const getHiddenButtonsConfig = (): ButtonsConfig => {
  const searchParams = new URLSearchParams(window.location.search)
  const hiddenButtons = searchParams.get('hiddenControls')

  if (!hiddenButtons) return {}

  return hiddenButtons.split(',').reduce((acc, button) => {
    if (button) acc[button] = { hidden: true }

    return acc
  }, {})
}

let structServiceProvider: StructServiceProvider =
  new RemoteStructServiceProvider(
    process.env.API_PATH || process.env.REACT_APP_API_PATH!
  )
if (process.env.MODE === 'standalone') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { StandaloneStructServiceProvider } = require('ketcher-standalone')
  structServiceProvider =
    new StandaloneStructServiceProvider() as StructServiceProvider
}

const enablePolymerEditor = process.env.ENABLE_POLYMER_EDITOR === 'true'

type PolymerType = () => JSX.Element | null

let PolymerEditor: PolymerType = () => null
if (enablePolymerEditor) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Editor } = require('ketcher-polymer-editor-react')
  PolymerEditor = Editor as PolymerType
}
// async function fetchAndInstantiate() {
//   const response = await fetch("./example.wasm");
//   console.log("featch test1", response)
//
//   const buffer = await response.arrayBuffer();
//   console.log("response test", buffer)
//   const obj = await WebAssembly.instantiate(buffer);
//   console.log("test", obj);  // "3"
// }
const App = () => {
  const hiddenButtonsConfig = getHiddenButtonsConfig()
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showPolymerEditor, setShowPolymerEditor] = useState(false)
    // @ts-ignore
    import('./factorial.wasm').then(({ _Z4facti: AsyncFactorial }) => {
        console.log('---- Async Wasm Module');
        console.log(AsyncFactorial); // [native code]
        console.log(AsyncFactorial(1));
        console.log(AsyncFactorial(2));
        console.log(AsyncFactorial(3));
    });

    // const { loaded, instance, error } = useAsBind("./indigo-ketcher.wasm");
  // console.log("test",{ loaded, instance, error })
  useEffect(() => {
    const abortController = new AbortController();
     const f = async () => {
      const resp = await fetchWasm('./indigo-ketcher.wasm', abortController.signal)
       console.log({resp})
     }

     f()
  }, [])

  return showPolymerEditor ? (
    <>
      <PolymerEditor />
      <PolymerToggler toggle={setShowPolymerEditor} />
    </>
  ) : (
    <>
      <Editor
        errorHandler={(message: string) => {
          setHasError(true)
          setErrorMessage(message.toString())
        }}
        buttons={hiddenButtonsConfig}
        staticResourcesUrl={process.env.PUBLIC_URL!}
        structServiceProvider={structServiceProvider}
        onInit={(ketcher: Ketcher) => {
          ;(global as any).ketcher = ketcher
          window.parent.postMessage(
            {
              eventType: 'init'
            },
            '*'
          )
        }}
      />
      {enablePolymerEditor && <PolymerToggler toggle={setShowPolymerEditor} />}
      {hasError && (
        <ErrorModal
          message={errorMessage}
          close={() => {
            setHasError(false)

            // Focus on editor after modal is closed
            const cliparea: HTMLElement = document.querySelector('.cliparea')!
            cliparea?.focus()
          }}
        />
      )}
    </>
  )
}

export default App

