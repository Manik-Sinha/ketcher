/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import * as KN from 'w3c-keyname'

import { FC, ReactElement, useLayoutEffect, useRef } from 'react'

import Icon from '../../../component/view/icon'
import clsx from 'clsx'
import styles from './Dialog.module.less'

interface DialogParamsCallProps {
  onCancel: () => void
  onOk: (result: any) => void
}

export interface DialogParams extends DialogParamsCallProps {
  className?: string
}

interface DialogProps {
  title?: string
  params: DialogParams
  buttons?: Array<string | ReactElement>
  buttonsTop?: Array<ReactElement>
  className?: string
  needMargin?: boolean
  withDivider?: boolean
  headerContent?: ReactElement
  buttonsNameMap?: {
    [key in string]: string
  }
}

interface DialogCallProps {
  result?: () => any
  valid?: () => boolean
}

type Props = DialogProps & DialogCallProps

const Dialog: FC<Props> = (props) => {
  const {
    children,
    title,
    params,
    result = () => null,
    valid = () => !!result(),
    buttons = ['OK'],
    headerContent,
    className,
    buttonsNameMap,
    buttonsTop,
    needMargin = true,
    withDivider = false,
    ...rest
  } = props
  const dialogRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const focusСandidate = dialogRef.current?.querySelector('input')
    if (focusСandidate) {
      focusСandidate.focus()
    } else {
      ;(dialogRef.current as any).focus()
    }
    return () => {
      ;(
        dialogRef.current
          ?.closest('.Ketcher-root')
          ?.getElementsByClassName('cliparea')[0] as any
      ).focus()
    }
  }, [])

  const isButtonOk = (button) => {
    return button === 'OK' || button === 'Save'
  }

  const exit = (mode) => {
    const key = isButtonOk(mode) ? 'onOk' : 'onCancel'
    if (params && key in params && (key !== 'onOk' || valid()))
      params[key](result())
  }

  const keyDown = (event) => {
    const key = KN.keyName(event)
    const active = document.activeElement
    const activeTextarea = active && active.tagName === 'TEXTAREA'
    if (key === 'Escape' || (key === 'Enter' && !activeTextarea)) {
      exit(key === 'Enter' ? 'OK' : 'Cancel')
      event.preventDefault()
      event.stopPropagation()
    }
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      onSubmit={(event) => event.preventDefault()}
      onKeyDown={keyDown}
      tabIndex={-1}
      className={clsx(styles.dialog, className, params.className)}
      {...rest}
    >
      <header
        className={clsx(styles.header, withDivider && styles.withDivider)}
      >
        {headerContent || <span>{title}</span>}
        <div className={styles.btnContainer}>
          {buttonsTop && buttonsTop.map((button) => button)}
          <button className={styles.buttonTop} onClick={() => exit('Cancel')}>
            <Icon name={'close'} className={styles.closeButton} />
          </button>
        </div>
      </header>
      <div className={clsx(styles.body, needMargin && styles.withMargin)}>
        {children}
      </div>

      {buttons.length > 0 && (
        <footer className={styles.footer}>
          {buttons.map((button) =>
            typeof button !== 'string' ? (
              button
            ) : (
              <input
                key={button}
                type="button"
                className={clsx(
                  isButtonOk(button) ? styles.ok : styles.cancel,
                  button === 'Save' && styles.save
                )}
                value={
                  buttonsNameMap && buttonsNameMap[button]
                    ? buttonsNameMap[button]
                    : button
                }
                disabled={isButtonOk(button) && !valid()}
                onClick={() => exit(button)}
              />
            )
          )}
        </footer>
      )}
    </div>
  )
}

export default Dialog
