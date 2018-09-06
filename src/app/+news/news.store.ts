import { News } from '../shared/model/News';
import { Injectable } from '@angular/core';
import { Store } from '../store/store';
import { PagedResult } from '../shared/model/PagedResult';

export class NewsState {
  current: News;
  list: PagedResult<News>;
  currentList: string;
}

@Injectable({providedIn: 'root'})
export class NewsStore extends Store<NewsState> {
  constructor () {
    super('news', new NewsState());
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
