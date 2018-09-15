_MODULES.push({
    description: `
      <ul>
        <li>If you click on/hover over (you can decide which one) the group icon (<i class="fa fa-user"></i>) of a giveaway (in any page) it shows the groups that the giveaway is for. There is also an option to automatically load the groups on page load and show them below the giveaway (which also works in your <a href="https://www.steamgifts.com/giveaways/created">created</a>/<a href="https://www.steamgifts.com/giveaways/entered">entered</a>/<a href="https://www.steamgifts.com/giveaways/won">won</a> pages if [id=cewgd] is enabled).</li>
        <li>Has [id=gh] built-in.</li>
      </ul>
    `,
    features: {
      ggl_m: {
        name: `Only show groups that you are a member of.`,
        sg: true
      }
    },
    id: `ggl`,
    load: ggl,
    name: `Giveaway Group Loader`,
    options: {
      title: `Load as:`,
      values: [`Panel (On Page Load)`, `Popout (On Hover)`, `Popout (On Click)`, `Popup (On Click)`]
    },
    sg: true,
    sync: `Steam Groups`,
    type: `giveaways`
  });

  function ggl() {
    esgst.giveawayFeatures.push(
      esgst.ggl_index === 0 ?
      ggl_getGiveaways :
      ggl_setButtons
    );
  }

  function ggl_setButtons(giveaways, main) {
    let i, n;
    if ((main && !esgst.createdPath && !esgst.enteredPath && !esgst.wonPath) || !main) {
      for (i = 0, n = giveaways.length; i < n; ++i) {
        ggl_setButton(giveaways[i]);
      }
    }
  }

  function ggl_setButton(giveaway) {
    let container, context, delay, eventType, exitTimeout, newGiveaways, newGroups, onClick, savedGiveaways, savedGroups, timeout;
    if (giveaway.group) {
      switch (esgst.ggl_index) {
        case 1:
          eventType = `mouseenter`;
          onClick = false;
          delay = 1000;
          giveaway.group.addEventListener(`mouseleave`, event => {
            if (timeout) {
              clearTimeout(timeout);
              timeout = null;
            }
            exitTimeout = setTimeout(() => {
              if (context && !container.contains(event.relatedTarget)) {
                context.close();
              }
            }, 1000);
          });
          giveaway.group.addEventListener(`click`, () => {
            if (timeout) {
              clearTimeout(timeout);
              timeout = null;
            }
          });
          break;
        case 2:
          giveaway.group.removeAttribute(`href`);
          giveaway.group.classList.add(`esgst-clickable`);
          eventType = `click`;
          onClick = true;
          delay = 0;
          break;
        case 3:
          giveaway.group.removeAttribute(`href`);
          giveaway.group.classList.add(`esgst-clickable`);
          eventType = `click`;
          delay = 0;
          break;
      }
      giveaway.group.addEventListener(eventType, () => {
        timeout = setTimeout(async () => {
          if (context) {
            switch (esgst.ggl_index) {
              case 1:
                context.open(giveaway.group);
                break;
              case 2:
                if (context.isOpen) {
                  context.close();
                } else {
                  context.open(giveaway.group);
                }
                break;
              case 3:
                context.open();
                break;
            }
          } else {
            if (esgst.ggl_index === 3) {
              context = new Popup(`fa-user`, [{
                attributes: {
                  href: `${giveaway.url}/groups`
                },
                text: `Giveaway Groups`,
                type: `a`
              }]);
              container = context.scrollable;
              context.open();
            } else {
              context = new Popout(`esgst-ggl-popout`, null, 1000, onClick);
              container = context.popout;
              context.open(giveaway.group);
            }
            createElements(container, `inner`, [{
              attributes: {
                class: `fa fa-circle-o-notch fa-spin`
              },
              type: `i`
            }, {
              text: `Loading groups...`,
              type: `span`
            }]);
            newGiveaways = {};
            newGroups = {};
            let values = await getValues({
              giveaways: `{}`,
              groups: `[]`
            });
            savedGiveaways = JSON.parse(values.giveaways);
            savedGroups = JSON.parse(values.groups);
            ggl_loadGroups([giveaway], 0, 1, newGiveaways, newGroups, savedGiveaways, savedGroups, groups => {
              let className, code, group, groupCount, i, j, n, link;
              if (groups) {
                createElements(container, `inner`, [{
                  attributes: {
                    class: `esgst-text-left table esgst-hidden`
                  },
                  type: `div`,
                  children: [{
                    attributes: {
                      class: `table__rows`
                    },
                    type: `div`
                  }]
                }]);
                groupCount = 0;
                for (i = 0, n = groups.length; i < n; ++i) {
                  code = groups[i];
                  for (j = savedGroups.length - 1; j >= 0 && savedGroups[j].code !== code; --j);
                  if (j >= 0) {
                    group = savedGroups[j];
                  } else {
                    group = newGroups[code];
                  }
                  if (group && group.member) {
                    className = `esgst-ggl-member`;
                    groupCount += 1;
                  } else if (esgst.ggl_m) {
                    className = `esgst-hidden`;
                  } else {
                    className = ``;
                    groupCount += 1;
                  }
                  if (className !== `esgst-hidden`) {
                    link = createElements(container.firstElementChild.firstElementChild, `beforeEnd`, [{
                      attributes: {
                        class: `table__row-outer-wrap ${className}`
                      },
                      type: `div`,
                      children: [{
                        attributes: {
                          class: `table__row-inner-wrap`
                        },
                        type: `div`,
                        children: [{
                          type: `div`,
                          children: [{
                            attributes: {
                              class: `table_image_avatar`,
                              href: `/group/${group.code}/`,
                              style: `background-image:url(http://cdn.edgecast.steamstatic.com/steamcommunity/public/images/avatars/${group.avatar}_medium.jpg)`
                            },
                            type: `a`
                          }]
                        }, {
                          attributes: {
                            class: `table__column--width-fill`
                          },
                          type: `div`,
                          children: [{
                            attributes: {
                              class: `table__column__heading`,
                              href: `/group/${group.code}/`
                            },
                            type: `a`
                          }]
                        }]
                      }]
                    }]).getElementsByClassName(`table__column__heading`)[0];
                    link.textContent = group.name;
                  }
                }
                if (groupCount === 0) {
                  createElements(container, `inner`, [{
                    attributes: {
                      class: `fa fa-exclamation-mark`
                    },
                    type: `i`
                  }, {
                    text: `You are not a member of any group in this giveaway.`,
                    type: `span`
                  }]);
                } else {
                  container.firstElementChild.classList.remove(`esgst-hidden`);
                  endless_load(container);
                }
                if (esgst.ggl_index === 2) {
                  createElements(container, `afterBegin`, [{
                    type: `div`,
                    children: [{
                      attributes: {
                        class: `esgst-ggl-heading`,
                        href: `${giveaway.url}/groups`
                      },
                      text: `Giveaway Groups`,
                      type: `a`
                    }]
                  }]);
                }
                context.reposition();
              } else {
                createElements(container, `inner`, [{
                  attributes: {
                    class: `fa fa-times-circle`
                  },
                  type: `i`
                }, {
                  text: `An error ocurred.`,
                  type: `span`
                }]);
                if (esgst.ggl_index === 2) {
                  createElements(container, `afterBegin`, [{
                    type: `div`,
                    children: [{
                      attributes: {
                        class: `esgst-ggl-heading`,
                        href: `${giveaway.url}/groups`
                      },
                      text: `Giveaway Groups`,
                      type: `a`
                    }]
                  }]);
                }
                context.reposition();
              }
            });
          }
          if (esgst.ggl_index === 1) {
            container.onmouseenter = () => {
              if (exitTimeout) {
                clearTimeout(exitTimeout);
                exitTimeout = null;
              }
            };
          }
        }, delay);
      });
    }
  }

  async function ggl_getGiveaways(giveaways) {
    let newGiveaways = {};
    let newGroups = {};
    let values = await getValues({
      giveaways: `{}`,
      groups: `[]`
    });
    let savedGiveaways = JSON.parse(values.giveaways);
    let savedGroups = JSON.parse(values.groups);
    ggl_loadGroups(giveaways, 0, giveaways.length, newGiveaways, newGroups, savedGiveaways, savedGroups);
  }

  async function ggl_loadGroups(giveaways, i, n, newGiveaways, newGroups, savedGiveaways, savedGroups, callback) {
    let giveaway, found, j, k;
    if (i < n) {
      giveaway = giveaways[i];
      if (giveaway.group) {
        if (savedGiveaways[giveaway.code] && Array.isArray(savedGiveaways[giveaway.code].groups) && savedGiveaways[giveaway.code].groups.length) {
          found = true;
          for (j = savedGiveaways[giveaway.code].groups.length - 1; j > -1 && found; --j) {
            for (k = esgst.groups.length - 1; k > -1 && esgst.groups[k].code !== savedGiveaways[giveaway.code].groups[j]; --k);
            if (k <= -1) {
              found = false;
            }
          }
        }
        if (found) {
          if (callback) {
            callback(savedGiveaways[giveaway.code].groups);
          } else {
            ggl_addPanel(giveaway, savedGiveaways[giveaway.code].groups, newGroups, savedGroups);
          }
          setTimeout(() => ggl_loadGroups(giveaways, ++i, n, newGiveaways, newGroups, savedGiveaways, savedGroups), 0);
        } else {
          ggl_getGroups([], 1, newGroups, `${giveaway.url}/groups/search?page=`, groups => {
            if (groups) {
              newGiveaways[giveaway.code] = {
                groups: groups
              };
              if (callback) {
                callback(groups);
              } else {
                ggl_addPanel(giveaway, groups, newGroups, savedGroups);
              }
              setTimeout(() => ggl_loadGroups(giveaways, ++i, n, newGiveaways, newGroups,  savedGiveaways, savedGroups), 0);
            } else if (callback) {
              callback(null);
            } else {
              setTimeout(() => ggl_loadGroups(giveaways, ++i, n, newGiveaways, newGroups,  savedGiveaways, savedGroups), 0);
            }
          });
        }
      } else {
        setTimeout(() => ggl_loadGroups(giveaways, ++i, n, newGiveaways, newGroups,  savedGiveaways, savedGroups), 0);
      }
    } else {
      await lockAndSaveGiveaways(newGiveaways);
      await lockAndSaveGroups(newGroups);
    }
  }

  function ggl_addPanel(giveaway, groups, newGroups, savedGroups) {
    let className, code, group, groupCount, i, j, link, n, panel;
    if (!giveaway.summary.getElementsByClassName(`esgst-ggl-panel`)[0]) {
      panel = createElements(giveaway.summary, `beforeEnd`, [{
        attributes: {
          class: `esgst-ggl-panel`
        },
        type: `div`
      }]);
      groupCount = 0;
      giveaway.groups = [];
      for (i = 0, n = groups.length; i < n; ++i) {
        code = groups[i];
        for (j = savedGroups.length - 1; j >= 0 && savedGroups[j].code !== code; --j);
        if (j >= 0) {
          group = savedGroups[j];
        } else {
          group = newGroups[code];
        }
        giveaway.groups.push(group.name.toLowerCase());
        if (group && group.member) {
          className = `esgst-ggl-member`;
          groupCount += 1;
        } else if (esgst.ggl_m) {
          className = `esgst-hidden`;
        } else {
          className = ``;
          groupCount += 1;
        }
        if (className !== `esgst-hidden`) {
          link = createElements(panel, `beforeEnd`, [{
            attributes: {
              class: className
            },
            type: `div`,
            children: [{
              attributes: {
                class: `table_image_avatar`,
                href: `/group/${group.code}/`,
                style: `background-image:url(http://cdn.edgecast.steamstatic.com/steamcommunity/public/images/avatars/${group.avatar}_medium.jpg)`
              },
              type: `a`
            }, {
              attributes: {
                href: `/group/${group.code}/`
              },
              type: `a`
            }]
          }]).lastElementChild;
          link.textContent = group.name;
          if (esgst.ap) {
            ap_getAvatars(panel);
          }
        }
      }
      if (groupCount === 0) {
        panel.remove();
      }
    }
  }

  async function ggl_getGroups(groups, nextPage, newGroups, url, callback) {
    let code, element, elements, error, heading, i, match, n, pagination, responseHtml;
    responseHtml = parseHtml((await request({method: `GET`, url: `${url}${nextPage}`})).responseText);
    error = responseHtml.getElementsByClassName(`table--summary`)[0];
    if (error) {
      setTimeout(callback, 0, null);
    } else {
      elements = responseHtml.getElementsByClassName(`table__row-inner-wrap`);
      for (i = 0, n = elements.length; i < n; ++i) {
        element = elements[i];
        heading = element.getElementsByClassName(`table__column__heading`)[0];
        match = heading.getAttribute(`href`).match(/group\/(.+?)\//);
        code = match[1];
        newGroups[code] = {
          avatar: element.getElementsByClassName(`table_image_avatar`)[0].style.backgroundImage.match(/\/avatars\/(.+)_medium/)[1],
          code: code,
          name: heading.textContent
        };
        groups.push(code);
      }
      pagination = responseHtml.getElementsByClassName(`pagination__navigation`)[0];
      if (pagination && !pagination.lastElementChild.classList.contains(`is-selected`)) {
        setTimeout(() => ggl_getGroups(groups, ++nextPage, newGroups, url, callback), 0);
      } else {
        setTimeout(callback, 0, groups);
      }
    }
  }

