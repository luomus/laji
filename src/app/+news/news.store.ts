import { News } from '../shared/model/News';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Store } from '../store/store';
import { TransferState } from '@angular/platform-browser';
import { PagedResult } from '../shared/model/PagedResult';

export class NewsState {
  current: News;
  list: PagedResult<News>;
  currentList: string;
}

@Injectable({providedIn: 'root'})
export class NewsStore extends Store<NewsState> {
  constructor (transferState: TransferState, @Inject(PLATFORM_ID) platformId: Object) {
    super('news', new NewsState(), transferState, platformId);
  }

  setCurrent(news: News) {
    if (this.state.current && this.state.current.id === news.id) {
      return;
    }
    this.setState({
      ...this.state,
      current: news
    });
  }

  setList(listKey: string, news: PagedResult<News>) {
    if (this.state.currentList === listKey) {
      return;
    }
    this.setState({
      ...this.state,
      currentList: listKey,
      list: news
    });
  }
}
