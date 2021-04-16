import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MemoryRouter } from 'react-router-dom'
import ReactRouter from 'react-router'

import AppMenu from './AppMenu'

describe('AppMenu', () => {
  let history

  beforeEach(() => {
    jest.spyOn(ReactRouter, 'useParams').mockReturnValue({ fileId: 'file-id' })
    history = { push: jest.fn() }
    jest.spyOn(ReactRouter, 'useHistory').mockReturnValue(history)
    render(<MemoryRouter><AppMenu /></MemoryRouter>)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should have links to lists', () => {
    expect(screen.getByText('物品一覧').href).toEqual('http://localhost/app/file-id/belongings')
    expect(screen.getByText('保管場所一覧').href).toEqual('http://localhost/app/file-id/storages')
  })

  it('will be navigated to belongings with keywords when the search button has clicked', async () => {
    const keyword = '検索語'
    const textField = screen.getByLabelText('キーワード')
    fireEvent.change(textField, { target: { value: keyword } })
    await userEvent.type(screen.getByRole('button'), 'JavaScript')

    expect(history.push).toHaveBeenCalledWith('/app/file-id/belongings?keyword=' + encodeURIComponent(keyword))
  })

  it('wont navigate to belongings when the keyword is blank', async () => {
    const textField = screen.getByLabelText('キーワード')
    fireEvent.change(textField, { target: { value: '' } })
    await userEvent.type(screen.getByRole('button'), 'JavaScript')

    expect(history.push).not.toHaveBeenCalled()
  })
})
